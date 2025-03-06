from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
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
    images: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)  # Use the real auth function
):
    try:
        # Log the authenticated user
        user_id = str(current_user.get("_id"))
        logger.info(f"Creating listing for authenticated user: {user_id}")
        
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
        
        # Create the listing document with the authenticated user's ID
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
            "owner_id": user_id,  # Use the authenticated user's ID
            "created_at": datetime.utcnow()
        }
        
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

# Root endpoint to test if the router is mounted correctly
@router.get("/")
async def car_routes_root():
    logging.info("Root car routes endpoint called")
    return {"message": "Car routes API is working"}
