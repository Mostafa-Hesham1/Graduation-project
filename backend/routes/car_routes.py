from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Query
from pydantic import BaseModel
from database import db
from typing import List, Optional
import os
import uuid
from datetime import datetime
import logging
from bson import ObjectId
from routes.auth import get_current_user  # Import the proper authentication function

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Directory to save uploaded images
UPLOAD_DIRECTORY = "uploaded_images"

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# Car listing model
class CarListing(BaseModel):
    title: str
    make: str
    model: str
    year: int
    bodyType: str
    fuelType: str
    cc: int
    location: str
    kilometers: int
    transmissionType: str
    color: str
    condition: str
    chatOption: str
    price: float
    description: str

# Use the real get_current_user function from auth.py
@router.post("/list")
async def list_car(
    title: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    bodyType: str = Form(...),
    fuelType: str = Form(...),
    cc: int = Form(...),
    location: str = Form(...),
    kilometers: int = Form(...),
    transmissionType: str = Form(...),
    color: str = Form(...),
    condition: str = Form(...),
    chatOption: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    showPhoneNumber: bool = Form(False),  # Flag to show phone number
    phoneNumber: Optional[str] = Form(None),  # Optional phone number field
    images: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Log the authenticated user
        user_id = str(current_user.get("_id"))
        logger.info(f"Creating listing for authenticated user: {user_id}")
        
        # Log phone number status for debugging
        logger.info(f"showPhoneNumber: {showPhoneNumber}, phoneNumber: {phoneNumber}")
        
        # Get user's phone from the database if not provided but showPhoneNumber is True
        phone_number = phoneNumber
        if showPhoneNumber and not phone_number:
            phone_number = current_user.get("phone")
            logger.info(f"Using phone number from user profile: {phone_number}")
        
        # Define the directory and ensure it exists
        upload_dir = os.path.join(os.path.dirname(__file__), "../uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        saved_image_paths = []
        for image in images:
            contents = await image.read()
            file_ext = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{file_ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            with open(file_path, "wb") as f:
                f.write(contents)
            saved_image_paths.append(unique_filename)
        
        # Create the listing document with the authenticated user's ID and phone info
        listing = {
            "title": title,
            "make": make,
            "model": model,
            "year": year,
            "bodyType": bodyType,
            "fuelType": fuelType,
            "cc": cc,
            "location": location,
            "kilometers": kilometers,
            "transmissionType": transmissionType,
            "color": color,
            "condition": condition,
            "chatOption": chatOption,
            "price": price,
            "description": description,
            "images": saved_image_paths,
            "owner_id": user_id,
            "showPhoneNumber": showPhoneNumber,
            "phoneNumber": phone_number,  # Save the phone number in the listing
            "created_at": datetime.utcnow()
        }
        
        # Log the phone number being saved
        logger.info(f"Saving listing with phoneNumber: {phone_number}")
        
        # Insert the listing into the database
        result = await db.car_listings.insert_one(listing)
        return {
            "message": "Car listing created successfully", 
            "listing_id": str(result.inserted_id),
            "owner_id": user_id
        }
    
    except Exception as e:
        logger.error(f"Error in list_car: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Updated endpoint to get user's own listings
@router.get("/my-listings")
async def get_user_listings(current_user: dict = Depends(get_current_user)):
    try:
        # Get the authenticated user's ID
        user_id = str(current_user.get("_id"))
        logger.info(f"Fetching listings for user: {user_id}")
        
        # Query for listings with the user's ID
        cursor = db.car_listings.find({"owner_id": user_id})
        
        # Process the results
        listings = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
            
            # Convert datetime objects to ISO format for JSON serialization
            if "created_at" in doc and doc["created_at"]:
                doc["created_at"] = doc["created_at"].isoformat()
                
            listings.append(doc)
        
        logger.info(f"Found {len(listings)} listings for user {user_id}")
        return {"listings": listings}
        
    except Exception as e:
        logger.error(f"Error fetching user listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting listings: {str(e)}")

# Add a fallback endpoint that doesn't require authentication
@router.get("/my-listings-public")
async def get_public_listings():
    """A fallback endpoint that returns sample data without requiring authentication"""
    try:
        logger.info("Serving public listings data (no auth required)")
        
        # Return sample data
        sample_listings = [
            {
                "_id": "sample1",
                "title": "Sample BMW 320i",
                "make": "BMW",
                "model": "320i",
                "year": 2019,
                "bodyType": "SEDAN",
                "fuelType": "Benzine",
                "price": 15000,
                "kilometers": 45000,
                "transmissionType": "automatic",
                "color": "Black",
                "condition": "Used",
                "location": "Cairo",
                "description": "Sample listing for testing",
                "created_at": "2023-01-01T00:00:00",
                "images": []
            }
        ]
        
        return {"listings": sample_listings}
        
    except Exception as e:
        logger.error(f"Error fetching sample listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting sample listings: {str(e)}")

# Add the missing endpoint for marketplace listings with filters
@router.get("/listings")
async def get_car_listings(
    page: int = Query(1, description="Page number for pagination"),
    limit: int = Query(12, description="Number of items per page"),
    make: Optional[str] = None,
    model: Optional[str] = None,
    minYear: Optional[int] = None,
    maxYear: Optional[int] = None,
    bodyType: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    location: Optional[str] = None,
    fuelType: Optional[str] = None,
    transmissionType: Optional[str] = None,
    color: Optional[List[str]] = Query(None),
    condition: Optional[str] = None,
    search: Optional[str] = None,
    sortBy: Optional[str] = "newest",
    exclude_user_id: Optional[str] = None,
):
    try:
        logger.info(f"Fetching car listings with filters. Page: {page}, Limit: {limit}, Sort: {sortBy}")
        
        # Build the filter query
        filter_query = {}
        
        # Apply filters if they exist
        if make:
            filter_query["make"] = make
        if model:
            filter_query["model"] = model
        if minYear and maxYear:
            filter_query["year"] = {"$gte": minYear, "$lte": maxYear}
        elif minYear:
            filter_query["year"] = {"$gte": minYear}
        elif maxYear:
            filter_query["year"] = {"$lte": maxYear}
        if bodyType:
            filter_query["bodyType"] = bodyType
        if minPrice and maxPrice:
            filter_query["price"] = {"$gte": minPrice, "$lte": maxPrice}
        elif minPrice:
            filter_query["price"] = {"$gte": minPrice}
        elif maxPrice:
            filter_query["price"] = {"$lte": maxPrice}
        if location:
            filter_query["location"] = location
        if fuelType:
            filter_query["fuelType"] = fuelType
        if transmissionType:
            filter_query["transmissionType"] = transmissionType
        if color and isinstance(color, list) and len(color) > 0:
            filter_query["color"] = {"$in": color}
        if condition:
            filter_query["condition"] = condition
        if search:
            # Text search across multiple fields
            filter_query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"make": {"$regex": search, "$options": "i"}},
                {"model": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Exclude user's own listings - simplify the logic for robustness
        if exclude_user_id:
            logger.info(f"Excluding listings from user: {exclude_user_id}")
            
            # Create exclusion condition that handles both string and ObjectId formats
            exclusion_condition = {
                "owner_id": {"$ne": exclude_user_id}
            }
            
            # If it's a valid ObjectId, also try excluding the ObjectId version
            if ObjectId.is_valid(exclude_user_id):
                object_id = ObjectId(exclude_user_id)
                # Use $and to combine existing filters with the owner_id filter
                if "$and" not in filter_query:
                    filter_query["$and"] = []
                
                filter_query["$and"].append({
                    "$or": [
                        {"owner_id": {"$ne": exclude_user_id}},
                        {"owner_id": {"$ne": object_id}}
                    ]
                })
                
                logger.info(f"Applied ObjectId exclusion for user: {exclude_user_id}")
            else:
                # Simple string comparison if not a valid ObjectId
                filter_query["owner_id"] = {"$ne": exclude_user_id}
            
            logger.info(f"Final filter query: {filter_query}")
        
        # Determine sort order (with improved handling of various formats)
        sort_order = {}
        if sortBy == "newest":
            sort_order["created_at"] = -1
        elif sortBy == "oldest":
            sort_order["created_at"] = 1
        elif sortBy in ["priceAsc", "price_low"]:  # Support both naming conventions
            sort_order["price"] = 1
        elif sortBy in ["priceDesc", "price_high"]:  # Support both naming conventions
            sort_order["price"] = -1
        else:
            # Default to newest first
            sort_order["created_at"] = -1
        
        # Ensure valid pagination parameters
        page = max(1, page)  # Ensure page is at least 1
        limit = max(1, min(limit, 100))  # Reasonable upper limit
        
        # Calculate skip value for pagination
        skip = (page - 1) * limit
        
        # Get total count for pagination info
        total_count = await db.car_listings.count_documents(filter_query)
        total_pages = max(1, (total_count + limit - 1) // limit)  # Ceiling division, min 1 page
        
        # Log pagination details for debugging
        logger.info(f"Pagination: page={page}, limit={limit}, skip={skip}, total={total_count}, pages={total_pages}")
        
        # Get the data with pagination
        cursor = db.car_listings.find(filter_query).sort(sort_order).skip(skip).limit(limit)
        
        # Process the results
        listings = []
        async for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            
            # Convert owner_id to string for consistent comparison on frontend
            if "owner_id" in doc and doc["owner_id"]:
                if isinstance(doc["owner_id"], ObjectId):
                    doc["owner_id"] = str(doc["owner_id"])
            
            # Add user information to the listing
            if "owner_id" in doc:
                owner_id = doc["owner_id"]
                # Convert owner_id to ObjectId if it's a string
                if isinstance(owner_id, str) and ObjectId.is_valid(owner_id):
                    owner_id = ObjectId(owner_id)
                
                # Look up the user to get the username
                if isinstance(owner_id, ObjectId):
                    user = await db.users.find_one({"_id": owner_id})
                    if user and "username" in user:
                        doc["owner_name"] = user["username"]
                    else:
                        doc["owner_name"] = "Unknown Seller"
                else:
                    doc["owner_name"] = "Unknown Seller"
            else:
                doc["owner_name"] = "Unknown Seller"
            
            # Convert datetime objects to ISO format
            if "created_at" in doc and doc["created_at"]:
                doc["created_at"] = doc["created_at"].isoformat()
                
            listings.append(doc)
        
        logger.info(f"Returning {len(listings)} listings (page {page} of {total_pages})")
        
        # Return response with pagination metadata
        return {
            "listings": listings,
            "pagination": {
                "total": total_count,
                "page": page,
                "totalPages": total_pages,
                "limit": limit,
                "hasMore": page < total_pages,
                "sortBy": sortBy  # Include sortBy in response for debugging
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching car listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting car listings: {str(e)}")

# Add a new endpoint to get listing details by ID
@router.get("/listing/{listing_id}")
async def get_listing_details(listing_id: str):
    try:
        logger.info(f"Fetching listing with ID: {listing_id}")
        
        # Validate the ID format
        if not ObjectId.is_valid(listing_id):
            logger.error(f"Invalid listing ID format: {listing_id}")
            raise HTTPException(status_code=400, detail=f"Invalid listing ID format: {listing_id}")
        
        # Convert string ID to ObjectId
        object_id = ObjectId(listing_id)
        listing = await db.car_listings.find_one({"_id": object_id})
        
        if not listing:
            logger.error(f"Listing not found: {listing_id}")
            raise HTTPException(status_code=404, detail=f"Listing {listing_id} not found")
        
        logger.info(f"Listing found: {listing_id}")
        
        # Convert ObjectId to string for JSON serialization
        listing["_id"] = str(listing["_id"])
        
        # Add user information to the listing
        if "owner_id" in listing:
            owner_id = listing["owner_id"]
            # Convert owner_id to ObjectId if it's a string
            if isinstance(owner_id, str) and ObjectId.is_valid(owner_id):
                owner_id = ObjectId(owner_id)
            
            # Look up the user to get the username
            if isinstance(owner_id, ObjectId):
                user = await db.users.find_one({"_id": owner_id})
                if user and "username" in user:
                    listing["owner_name"] = user["username"]
                else:
                    listing["owner_name"] = "Unknown Seller"
            else:
                listing["owner_name"] = "Unknown Seller"
            
            # Convert owner_id to string if it's an ObjectId
            if isinstance(listing["owner_id"], ObjectId):
                listing["owner_id"] = str(listing["owner_id"])
        else:
            listing["owner_name"] = "Unknown Seller"
        
        # Convert datetime objects to ISO format
        if "created_at" in listing and listing["created_at"]:
            listing["created_at"] = listing["created_at"].isoformat()
        
        return listing
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting listing details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting listing details: {str(e)}")

# Root endpoint to test if the router is mounted correctly
@router.get("/")
async def car_routes_root():
    logging.info("Root car routes endpoint called")
    return {"message": "Car routes API is working"}
