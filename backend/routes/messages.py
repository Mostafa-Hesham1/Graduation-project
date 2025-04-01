from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import db
from bson import ObjectId
from routes.auth import get_current_user
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Message model
class MessageCreate(BaseModel):
    recipient_id: str
    content: str
    listing_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    recipient_id: str
    recipient_name: str
    content: str
    listing_id: Optional[str] = None
    listing_title: Optional[str] = None
    is_read: bool
    created_at: str

@router.post("/messages/send")
async def send_message(
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to another user"""
    try:
        # Get sender info
        sender_id = str(current_user["_id"])
        sender_name = current_user.get("username", "Unknown User")
        
        # Validate recipient exists
        if not ObjectId.is_valid(message.recipient_id):
            raise HTTPException(status_code=400, detail="Invalid recipient ID")
        
        recipient_obj_id = ObjectId(message.recipient_id)
        recipient = await db.users.find_one({"_id": recipient_obj_id})
        
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient not found")
        
        recipient_name = recipient.get("username", "Unknown User")
        
        # Validate listing if provided
        listing_title = None
        if message.listing_id:
            if not ObjectId.is_valid(message.listing_id):
                raise HTTPException(status_code=400, detail="Invalid listing ID")
                
            listing_obj_id = ObjectId(message.listing_id)
            listing = await db.car_listings.find_one({"_id": listing_obj_id})
            
            if not listing:
                raise HTTPException(status_code=404, detail="Listing not found")
                
            listing_title = listing.get("title", "Unknown Listing")
        
        # Create message object
        now = datetime.utcnow()
        new_message = {
            "sender_id": sender_id,
            "sender_name": sender_name,
            "recipient_id": message.recipient_id,
            "recipient_name": recipient_name,
            "content": message.content,
            "is_read": False,
            "created_at": now
        }
        
        # Add listing info if provided
        if message.listing_id:
            new_message["listing_id"] = message.listing_id
            new_message["listing_title"] = listing_title
        
        # Insert message into database
        result = await db.messages.insert_one(new_message)
        new_message["_id"] = str(result.inserted_id)
        
        # Format created_at as ISO string for response
        new_message["created_at"] = new_message["created_at"].isoformat()
        
        logger.info(f"Message sent from {sender_id} to {message.recipient_id}")
        
        return {
            "message": "Message sent successfully",
            "message_id": str(result.inserted_id),
            "message_data": new_message
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@router.get("/messages/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get list of conversations for the current user"""
    try:
        user_id = str(current_user["_id"])
        
        # Get all messages where the user is either sender or recipient
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"sender_id": user_id},
                        {"recipient_id": user_id}
                    ]
                }
            },
            # Sort by created_at in descending order
            {"$sort": {"created_at": -1}},
            # Group by conversation partner
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", user_id]},
                            "$recipient_id",  # If user is sender, group by recipient
                            "$sender_id"      # If user is recipient, group by sender
                        ]
                    },
                    "last_message": {"$first": "$$ROOT"},
                    "unread_count": {
                        "$sum": {
                            "$cond": [
                                {"$and": [
                                    {"$eq": ["$recipient_id", user_id]},
                                    {"$eq": ["$is_read", False]}
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            # Project fields we need
            {
                "$project": {
                    "partner_id": "$_id",
                    "partner_name": "$last_message.sender_name",
                    "last_message": {
                        "id": {"$toString": "$last_message._id"},
                        "content": "$last_message.content",
                        "created_at": "$last_message.created_at",
                        "is_read": "$last_message.is_read",
                        "listing_id": "$last_message.listing_id",
                        "listing_title": "$last_message.listing_title"
                    },
                    "unread_count": 1
                }
            },
            # Sort by last message date
            {"$sort": {"last_message.created_at": -1}}
        ]
        
        conversations = []
        async for doc in db.messages.aggregate(pipeline):
            # Fix partner name based on who sent the last message
            partner_id = doc["partner_id"]
            
            # Determine if the last message is from the current user or the partner
            is_last_message_from_me = doc["last_message"].get("sender_id", "") == user_id
            
            # If last message is from the current user, get partner name from the last message recipient
            if is_last_message_from_me:
                last_message = await db.messages.find_one({"_id": ObjectId(doc["last_message"]["id"])})
                if last_message:
                    doc["partner_name"] = last_message.get("recipient_name", "Unknown User")
            else:
                # Otherwise, get partner name from the last message sender
                last_message = await db.messages.find_one({"_id": ObjectId(doc["last_message"]["id"])})
                if last_message:
                    doc["partner_name"] = last_message.get("sender_name", "Unknown User")
            
            # Convert ObjectId to string
            doc["last_message"]["created_at"] = doc["last_message"]["created_at"].isoformat()
            
            conversations.append(doc)
        
        return {"conversations": conversations}
    
    except Exception as e:
        logger.error(f"Error getting conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting conversations: {str(e)}")

@router.get("/messages/{user_id}")
async def get_messages(
    user_id: str,
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get messages between current user and another user"""
    try:
        # Validate user ID
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        current_user_id = str(current_user["_id"])
        
        # Check if the other user exists
        other_user_obj_id = ObjectId(user_id)
        other_user = await db.users.find_one({"_id": other_user_obj_id})
        
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build query to get messages between current user and other user
        query = {
            "$or": [
                {
                    "sender_id": current_user_id,
                    "recipient_id": user_id
                },
                {
                    "sender_id": user_id,
                    "recipient_id": current_user_id
                }
            ]
        }
        
        # If before parameter is provided, only get messages before that time
        if before:
            try:
                before_date = datetime.fromisoformat(before)
                query["created_at"] = {"$lt": before_date}
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format for 'before' parameter")
        
        # Get messages
        cursor = db.messages.find(query).sort("created_at", -1).limit(limit)
        
        messages = []
        async for doc in cursor:
            # Convert ObjectId to string
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            
            # Convert datetime to ISO string
            doc["created_at"] = doc["created_at"].isoformat()
            
            messages.append(doc)
        
        # Sort messages by date (oldest first)
        messages.sort(key=lambda x: x["created_at"])
        
        return {"messages": messages}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting messages: {str(e)}")

@router.post("/messages/{user_id}/mark-read")
async def mark_messages_as_read(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark all messages from a user as read"""
    try:
        # Validate user ID
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        current_user_id = str(current_user["_id"])
        
        # Mark all unread messages from the specified user as read
        result = await db.messages.update_many(
            {
                "sender_id": user_id,
                "recipient_id": current_user_id,
                "is_read": False
            },
            {"$set": {"is_read": True}}
        )
        
        logger.info(f"Marked {result.modified_count} messages as read")
        
        return {"marked_read": result.modified_count}
    
    except Exception as e:
        logger.error(f"Error marking messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error marking messages as read: {str(e)}")

@router.get("/messages/unread/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread messages for current user"""
    try:
        current_user_id = str(current_user["_id"])
        
        # Count unread messages where current user is recipient
        count = await db.messages.count_documents({
            "recipient_id": current_user_id,
            "is_read": False
        })
        
        return {"unread_count": count}
    
    except Exception as e:
        logger.error(f"Error getting unread count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting unread count: {str(e)}")

@router.get("/messages")
async def messages_root():
    """Root endpoint for messages API"""
    return {"message": "Messages API is working"}