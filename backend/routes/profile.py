from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import db
from bson import ObjectId
import os
import uuid
import logging
import json

# Add a custom JSON encoder for ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

router = APIRouter()

# JWT settings - Match your auth.py configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configure logging
logger = logging.getLogger(__name__)

async def get_current_user_from_token(authorization: str = Header(None)):
    """Extract user from JWT token - following your auth.py pattern exactly"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id") or payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        # Use await for async MongoDB operation
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return str(user["_id"])
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_user_data(user_id: str):
    """Get user data from MongoDB"""
    try:
        # Use await for async MongoDB operation
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert ObjectId to string
        user_dict = dict(user)
        user_dict["_id"] = str(user_dict["_id"])
        
        # Remove sensitive data
        user_dict.pop("password", None)
        user_dict.pop("hashed_password", None)
        
        return user_dict
    except Exception as e:
        logger.error(f"Error fetching user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user data")

# Pydantic models
class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    phone: Optional[str] = None
    created_date: str
    last_login: str

class ListedCar(BaseModel):
    car_id: str
    user_id: str
    title: str
    make: str
    model: str
    year: int
    price: float
    location: str
    status: str = "Active"
    date_listed: str
    views: int = 0

class FavoriteCar(BaseModel):
    favorite_id: str
    user_id: str
    car_id: str
    car_title: str
    car_make: str
    car_model: str
    car_price: float
    date_added: str

class UserPreferences(BaseModel):
    user_id: str
    email_notifications: bool = True
    sms_notifications: bool = False
    show_phone_number: bool = True
    preferred_contact_method: str = "email"

@router.get("/profile")
async def get_user_profile(user_id: str = Depends(get_current_user_from_token)):
    """Get user profile information"""
    try:
        user_data = await get_user_data(user_id)
        
        # Use the car_listings collection instead of listed_cars
        # This matches the collection used in car_routes.py
        car_listings_cursor = db.car_listings.find({"owner_id": user_id})
        car_listings = await car_listings_cursor.to_list(length=None)
        
        # Also fetch from the original listed_cars collection for backward compatibility
        listed_cars_cursor = db.listed_cars.find({"user_id": user_id})
        listed_cars = await listed_cars_cursor.to_list(length=None)
        
        # Combine both collections to ensure we get all listings
        all_listings = car_listings + listed_cars
        
        favorite_cars_cursor = db.favorite_cars.find({"user_id": user_id})
        favorite_cars = await favorite_cars_cursor.to_list(length=None)
        
        # Convert ObjectIds to strings in all results
        for car in all_listings:
            if "_id" in car:
                car["_id"] = str(car["_id"])
                
        for fav in favorite_cars:
            if "_id" in fav:
                fav["_id"] = str(fav["_id"])
        
        # Calculate statistics based on the combined listings
        statistics = {
            "total_listings": len(all_listings),
            "active_listings": len([car for car in all_listings if car.get("status") == "Active"]),
            "sold_cars": len([car for car in all_listings if car.get("status") == "Sold"]),
            "favorite_cars_count": len(favorite_cars),
            "total_views": sum(car.get("views", 0) for car in all_listings),
            "total_inquiries": sum(car.get("inquiries", 0) for car in all_listings)
        }
        
        # Log statistics for debugging
        logger.info(f"User {user_id} statistics: {statistics}")
        
        return {
            "status": "success",
            "profile": {
                "user_id": user_id,
                "name": user_data.get("username"),
                "email": user_data.get("email"),
                "phone": user_data.get("phone"),
                "created_date": user_data.get("created_at", datetime.now()).isoformat() if user_data.get("created_at") else datetime.now().isoformat()
            },
            "statistics": statistics
        }
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.get("/listed-cars")
async def get_listed_cars(user_id: str = Depends(get_current_user_from_token)):
    """Get user's listed cars from both collections"""
    try:
        # Fetch from both collections to ensure we get all listings
        
        # 1. Fetch from car_listings (used by car_routes.py)
        car_listings_cursor = db.car_listings.find({"owner_id": user_id}).sort("created_at", -1)
        car_listings = await car_listings_cursor.to_list(length=None)
        
        # 2. Fetch from listed_cars (original collection)
        listed_cars_cursor = db.listed_cars.find({"user_id": user_id}).sort("date_listed", -1)
        listed_cars = await listed_cars_cursor.to_list(length=None)
        
        # Combine the results from both collections
        all_listings = car_listings + listed_cars
        
        # Convert ObjectIds to strings for JSON serialization
        for car in all_listings:
            if "_id" in car:
                car["_id"] = str(car["_id"])
        
        # Log the number of listings found
        logger.info(f"Found {len(all_listings)} car listings for user {user_id}")
        
        return {
            "status": "success",
            "listed_cars": all_listings,
            "total": len(all_listings)
        }
    except Exception as e:
        logger.error(f"Error fetching listed cars: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching listed cars: {str(e)}")

@router.get("/favorite-cars")
async def get_favorite_cars(user_id: str = Depends(get_current_user_from_token)):
    """Get user's favorite cars"""
    try:
        # Use to_list() to properly handle async cursor
        cursor = db.favorite_cars.find({"user_id": user_id}).sort("date_added", -1)
        user_favorites = await cursor.to_list(length=None)
        
        # Convert ObjectIds to strings
        for favorite in user_favorites:
            if "_id" in favorite:
                favorite["_id"] = str(favorite["_id"])
        
        return {
            "status": "success",
            "favorite_cars": user_favorites,
            "total": len(user_favorites)
        }
    except Exception as e:
        logger.error(f"Error fetching favorite cars: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching favorite cars: {str(e)}")

@router.post("/favorite-cars/{car_id}")
async def add_to_favorites(car_id: str, user_id: str = Depends(get_current_user_from_token)):
    """Add a car to favorites"""
    try:
        # Use await for async MongoDB operation
        existing = await db.favorite_cars.find_one({"user_id": user_id, "car_id": car_id})
        if existing:
            return {"status": "success", "message": "Already in favorites"}
        
        new_favorite = {
            "favorite_id": str(uuid.uuid4()),
            "user_id": user_id,
            "car_id": car_id,
            "date_added": datetime.now().isoformat()
        }
        
        # Use await for async MongoDB operation
        await db.favorite_cars.insert_one(new_favorite)
        
        return {"status": "success", "message": "Added to favorites"}
    except Exception as e:
        logger.error(f"Error adding to favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding to favorites: {str(e)}")

@router.delete("/favorite-cars/{car_id}")
async def remove_from_favorites(car_id: str, user_id: str = Depends(get_current_user_from_token)):
    """Remove from favorites"""
    try:
        # Use await for async MongoDB operation
        result = await db.favorite_cars.delete_one({"user_id": user_id, "car_id": car_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found in favorites")
        
        return {"status": "success", "message": "Removed from favorites"}
    except Exception as e:
        logger.error(f"Error removing from favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing from favorites: {str(e)}")

@router.put("/listed-cars/{car_id}/status")
async def update_car_status(car_id: str, status: str = Form(...), user_id: str = Depends(get_current_user_from_token)):
    """Update car status"""
    try:
        # Use await for async MongoDB operation
        result = await db.listed_cars.update_one(
            {"car_id": car_id, "user_id": user_id},
            {"$set": {"status": status, "updated_at": datetime.now()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Car not found")
        
        return {"status": "success", "message": f"Status updated to {status}"}
    except Exception as e:
        logger.error(f"Error updating car status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating car status: {str(e)}")

@router.delete("/listed-cars/{car_id}")
async def delete_listed_car(car_id: str, user_id: str = Depends(get_current_user_from_token)):
    """Delete a listed car"""
    try:
        # Use await for async MongoDB operation
        result = await db.listed_cars.delete_one({"car_id": car_id, "user_id": user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Car not found")
        
        return {"status": "success", "message": "Car deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting car: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting car: {str(e)}")

@router.get("/preferences")
async def get_user_preferences(user_id: str = Depends(get_current_user_from_token)):
    """Get user preferences"""
    try:
        # Use await for async MongoDB operation
        preferences = await db.user_preferences.find_one({"user_id": user_id})
        
        if not preferences:
            default_preferences = {
                "user_id": user_id,
                "email_notifications": True,
                "sms_notifications": False,
                "show_phone_number": True,
                "preferred_contact_method": "email"
            }
            # Use await for async MongoDB operation
            await db.user_preferences.insert_one(default_preferences)
            return {"status": "success", "preferences": default_preferences}
        
        # Convert to dict and handle ObjectId serialization
        preferences_dict = dict(preferences)
        if "_id" in preferences_dict:
            preferences_dict["_id"] = str(preferences_dict["_id"])
        
        return {"status": "success", "preferences": preferences_dict}
    except Exception as e:
        logger.error(f"Error fetching preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching preferences: {str(e)}")

@router.put("/preferences")
async def update_user_preferences(
    email_notifications: bool = Form(True),
    sms_notifications: bool = Form(False),
    show_phone_number: bool = Form(True),
    preferred_contact_method: str = Form("email"),
    user_id: str = Depends(get_current_user_from_token)
):
    """Update user preferences"""
    try:
        updated_preferences = {
            "email_notifications": email_notifications,
            "sms_notifications": sms_notifications,
            "show_phone_number": show_phone_number,
            "preferred_contact_method": preferred_contact_method,
            "updated_at": datetime.now()
        }
        
        # Use await for async MongoDB operation
        await db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": updated_preferences},
            upsert=True
        )
        
        return {"status": "success", "message": "Preferences updated"}
    except Exception as e:
        logger.error(f"Error updating preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")

@router.put("/profile")
async def update_user_profile(
    name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_from_token)
):
    """Update user profile"""
    try:
        update_data = {
            "username": name,
            "email": email,
            "updated_at": datetime.now()
        }
        
        if phone:
            update_data["phone"] = phone
        
        # Use await for async MongoDB operation
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"status": "success", "message": "Profile updated"}
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.get("/export/data")
async def export_user_data(user_id: str = Depends(get_current_user_from_token)):
    """Export user data"""
    try:
        user_profile = await get_user_data(user_id)
        
        # Use to_list() to properly handle async cursor
        user_listings = await db.listed_cars.find({"user_id": user_id}).to_list(length=None)
        user_favorites = await db.favorite_cars.find({"user_id": user_id}).to_list(length=None)
        
        for car in user_listings:
            car["_id"] = str(car["_id"])
        for favorite in user_favorites:
            favorite["_id"] = str(favorite["_id"])
        
        export_data = {
            "user_id": user_id,
            "export_date": datetime.now().isoformat(),
            "profile": user_profile,
            "listed_cars": user_listings,
            "favorite_cars": user_favorites
        }
        
        return {"status": "success", "export_data": export_data}
    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

async def save_car_listing(user_id: str, car_data: dict):
    """Save a new car listing"""
    try:
        listing_data = {
            "car_id": str(uuid.uuid4()),
            "user_id": user_id,
            "date_listed": datetime.now().isoformat(),
            "views": 0,
            "status": "Active",
            **car_data
        }
        
        # Use await for async MongoDB operation
        result = await db.listed_cars.insert_one(listing_data)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving car listing: {str(e)}")
        return None
