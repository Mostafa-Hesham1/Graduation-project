from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Query
from pydantic import BaseModel
from database import db
from typing import List, Optional
from datetime import datetime
import uuid
import os
import logging
from bson import ObjectId
from routes.auth import get_current_user  # Import only the available function

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

# Use the available get_current_user function instead of get_current_user_from_token
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

# Fallback endpoint that doesn't require authentication
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

# Updated endpoint for marketplace listings with filters
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
        
        # Exclude user's own listings
        if exclude_user_id:
            logger.info(f"Excluding listings from user: {exclude_user_id}")
            filter_query["owner_id"] = {"$ne": exclude_user_id}
            logger.info(f"Final filter query: {filter_query}")
        
        # Determine sort order
        sort_order = {}
        if sortBy == "newest":
            sort_order["created_at"] = -1
        elif sortBy == "oldest":
            sort_order["created_at"] = 1
        elif sortBy in ["priceAsc", "price_low"]:
            sort_order["price"] = 1
        elif sortBy in ["priceDesc", "price_high"]:
            sort_order["price"] = -1
        else:
            sort_order["created_at"] = -1
        
        # Ensure valid pagination parameters
        page = max(1, page)
        limit = max(1, min(limit, 100))
        skip = (page - 1) * limit
        
        # Get total count for pagination
        total_count = await db.car_listings.count_documents(filter_query)
        total_pages = max(1, (total_count + limit - 1) // limit)
        logger.info(f"Pagination: page={page}, limit={limit}, skip={skip}, total={total_count}, pages={total_pages}")
        
        # Get data with pagination
        cursor = db.car_listings.find(filter_query).sort(sort_order).skip(skip).limit(limit)
        
        listings = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if "owner_id" in doc and doc["owner_id"]:
                if isinstance(doc["owner_id"], ObjectId):
                    doc["owner_id"] = str(doc["owner_id"])
            if "owner_id" in doc:
                owner_id = doc["owner_id"]
                if isinstance(owner_id, str) and ObjectId.is_valid(owner_id):
                    owner_id = ObjectId(owner_id)
                if isinstance(owner_id, ObjectId):
                    user_doc = await db.users.find_one({"_id": owner_id})
                    if user_doc and "username" in user_doc:
                        doc["owner_name"] = user_doc["username"]
                    else:
                        doc["owner_name"] = "Unknown Seller"
                else:
                    doc["owner_name"] = "Unknown Seller"
            else:
                doc["owner_name"] = "Unknown Seller"
            if "created_at" in doc and doc["created_at"]:
                doc["created_at"] = doc["created_at"].isoformat()
            listings.append(doc)
        
        logger.info(f"Returning {len(listings)} listings (page {page} of {total_pages})")
        
        return {
            "listings": listings,
            "pagination": {
                "total": total_count,
                "page": page,
                "totalPages": total_pages,
                "limit": limit,
                "hasMore": page < total_pages,
                "sortBy": sortBy
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching car listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting car listings: {str(e)}")

# New endpoint to get listing details by ID
@router.get("/listing/{listing_id}")
async def get_listing_details(listing_id: str):
    try:
        logger.info(f"Fetching listing with ID: {listing_id}")
        if not ObjectId.is_valid(listing_id):
            logger.error(f"Invalid listing ID format: {listing_id}")
            raise HTTPException(status_code=400, detail=f"Invalid listing ID format: {listing_id}")
        object_id = ObjectId(listing_id)
        listing = await db.car_listings.find_one({"_id": object_id})
        if not listing:
            logger.error(f"Listing not found: {listing_id}")
            raise HTTPException(status_code=404, detail=f"Listing {listing_id} not found")
        listing["_id"] = str(listing["_id"])
        if "owner_id" in listing:
            owner_id = listing["owner_id"]
            if isinstance(owner_id, str) and ObjectId.is_valid(owner_id):
                owner_id = ObjectId(owner_id)
            if isinstance(owner_id, ObjectId):
                user_doc = await db.users.find_one({"_id": owner_id})
                if user_doc and "username" in user_doc:
                    listing["owner_name"] = user_doc["username"]
                else:
                    listing["owner_name"] = "Unknown Seller"
            else:
                listing["owner_name"] = "Unknown Seller"
            if isinstance(listing["owner_id"], ObjectId):
                listing["owner_id"] = str(listing["owner_id"])
        else:
            listing["owner_name"] = "Unknown Seller"
        if "created_at" in listing and listing["created_at"]:
            listing["created_at"] = listing["created_at"].isoformat()
        return listing
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting listing details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting listing details: {str(e)}")

# New endpoint to delete a car listing
@router.delete("/{listing_id}")
async def delete_car_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Delete request for listing ID: {listing_id}")
        
        if not ObjectId.is_valid(listing_id):
            logger.error(f"Invalid listing ID format: {listing_id}")
            raise HTTPException(status_code=400, detail=f"Invalid listing ID format")
        
        # Get the authenticated user's ID
        user_id = str(current_user.get("_id"))
        
        # Find the listing
        object_id = ObjectId(listing_id)
        listing = await db.car_listings.find_one({"_id": object_id})
        
        if not listing:
            logger.error(f"Listing not found: {listing_id}")
            raise HTTPException(status_code=404, detail=f"Listing not found")
        
        # Check if the user is the owner of the listing
        if listing.get("owner_id") != user_id:
            logger.error(f"User {user_id} is not the owner of listing {listing_id}")
            raise HTTPException(status_code=403, detail="You do not have permission to delete this listing")
        
        # Delete the listing
        upload_dir = os.path.join(os.path.dirname(__file__), "../uploads")
        
        # Delete associated images from storage
        if "images" in listing and listing["images"]:
            for image_path in listing["images"]:
                try:
                    full_path = os.path.join(upload_dir, image_path)
                    if os.path.exists(full_path):
                        os.remove(full_path)
                        logger.info(f"Deleted image file: {full_path}")
                except Exception as img_err:
                    logger.warning(f"Failed to delete image {image_path}: {str(img_err)}")
        
        # Remove from database
        result = await db.car_listings.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            logger.error(f"Failed to delete listing: {listing_id}")
            raise HTTPException(status_code=500, detail="Failed to delete listing")
        
        logger.info(f"Successfully deleted listing: {listing_id}")
        return {"message": "Listing deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting car listing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting car listing: {str(e)}")

# New endpoint to update a car listing
@router.put("/{listing_id}")
async def update_car_listing(
    listing_id: str,
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
    showPhoneNumber: bool = Form(False),
    phoneNumber: Optional[str] = Form(None),
    newImages: Optional[List[UploadFile]] = File(None),
    existingImages: Optional[str] = Form(None),
    imagesToDelete: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Update request for listing ID: {listing_id}")
        
        if not ObjectId.is_valid(listing_id):
            logger.error(f"Invalid listing ID format: {listing_id}")
            raise HTTPException(status_code=400, detail=f"Invalid listing ID format")
        
        # Get the authenticated user's ID
        user_id = str(current_user.get("_id"))
        
        # Find the listing
        object_id = ObjectId(listing_id)
        existing_listing = await db.car_listings.find_one({"_id": object_id})
        
        if not existing_listing:
            logger.error(f"Listing not found: {listing_id}")
            raise HTTPException(status_code=404, detail=f"Listing not found")
        
        # Check if the user is the owner of the listing
        if existing_listing.get("owner_id") != user_id:
            logger.error(f"User {user_id} is not the owner of listing {listing_id}")
            raise HTTPException(status_code=403, detail="You do not have permission to update this listing")
        
        # Parse existingImages and imagesToDelete JSON strings
        existing_images_list = []
        if existingImages:
            try:
                import json
                existing_images_list = json.loads(existingImages)
                logger.info(f"Parsed existing images: {existing_images_list}")
            except Exception as e:
                logger.error(f"Error parsing existingImages JSON: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid existingImages format")
        
        images_to_delete = []
        if imagesToDelete:
            try:
                import json
                images_to_delete = json.loads(imagesToDelete)
                logger.info(f"Images to delete: {images_to_delete}")
            except Exception as e:
                logger.error(f"Error parsing imagesToDelete JSON: {str(e)}")
                raise HTTPException(status_code=400, detail="Invalid imagesToDelete format")
        
        # Get user's phone from the database if needed
        phone_number = phoneNumber
        if showPhoneNumber and not phone_number:
            phone_number = current_user.get("phone")
            logger.info(f"Using phone number from user profile: {phone_number}")
        
        # Handle file uploads
        upload_dir = os.path.join(os.path.dirname(__file__), "../uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Process new images
        new_image_paths = []
        if newImages:
            for image in newImages:
                contents = await image.read()
                if contents:  # Check if there's any content in the file
                    file_ext = os.path.splitext(image.filename)[1]
                    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
                    file_path = os.path.join(upload_dir, unique_filename)
                    with open(file_path, "wb") as f:
                        f.write(contents)
                    new_image_paths.append(unique_filename)
        
        # Delete images marked for deletion
        if images_to_delete:
            for image_path in images_to_delete:
                try:
                    full_path = os.path.join(upload_dir, image_path)
                    if os.path.exists(full_path):
                        os.remove(full_path)
                        logger.info(f"Deleted image: {image_path}")
                except Exception as img_err:
                    logger.warning(f"Failed to delete image {image_path}: {str(img_err)}")
        
        # Combine existing and new images
        final_images = existing_images_list + new_image_paths
        
        # Create updated listing data
        updated_listing = {
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
            "images": final_images,
            "showPhoneNumber": showPhoneNumber,
            "phoneNumber": phone_number,
            "updated_at": datetime.utcnow()
        }
        
        # Update the listing
        result = await db.car_listings.update_one(
            {"_id": object_id}, 
            {"$set": updated_listing}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No changes were made to listing {listing_id}")
        
        logger.info(f"Successfully updated listing: {listing_id}")
        
        # Return updated listing with ID included
        updated_listing["_id"] = listing_id
        return {
            "message": "Listing updated successfully",
            "listing": updated_listing
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating car listing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating car listing: {str(e)}")

# New endpoint to add a car to favorites
@router.post("/favorite/{car_id}")
async def add_to_favorites(car_id: str, user = Depends(get_current_user)):
    """Add a car to favorites with complete car details"""
    try:
        # Get user_id from the user object
        user_id = str(user["_id"])
        
        # Check if car exists
        car = await db.car_listings.find_one({"_id": ObjectId(car_id)})
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
        
        # Check if already in favorites
        existing = await db.favorite_cars.find_one({"user_id": user_id, "car_id": car_id})
        if existing:
            return {"status": "success", "message": "Already in favorites"}
        
        # Get the first image from the car's images array
        car_image_url = None
        if car.get("images") and len(car.get("images")) > 0:
            # Use the first image from the array
            car_image_url = car.get("images")[0]
        elif car.get("image_url"):
            car_image_url = car.get("image_url")
        
        # Create a more comprehensive favorite entry with all car details
        car_details = {
            "car_id": car_id,
            "car_make": car.get("make"),
            "car_model": car.get("model"),
            "car_year": car.get("year"),
            "car_price": car.get("price"),
            "car_title": car.get("title") or f"{car.get('make')} {car.get('model')} {car.get('year')}",
            "car_image_url": car_image_url,  # This will be the filename from uploads
            "car_location": car.get("location"),
            "car_mileage": car.get("kilometers"),
            "car_transmission": car.get("transmissionType"),
            "car_fuel_type": car.get("fuelType"),
            "car_color": car.get("color"),
            "car_body_type": car.get("bodyType")
        }
        
        new_favorite = {
            "favorite_id": str(uuid.uuid4()),
            "user_id": user_id,
            "date_added": datetime.now().isoformat(),
            **car_details
        }
        
        await db.favorite_cars.insert_one(new_favorite)
        
        # Update user statistics
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"favorite_count": 1}}
        )
        
        return {"status": "success", "message": "Added to favorites", "car_details": car_details}
    
    except Exception as e:
        logger.error(f"Error adding to favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding to favorites: {str(e)}")

@router.delete("/favorite/{car_id}")
async def remove_from_favorites(car_id: str, user = Depends(get_current_user)):
    """Remove a car from favorites"""
    try:
        # Get user_id from the user object
        user_id = str(user["_id"])
        
        # Remove from favorites
        result = await db.favorite_cars.delete_one({"user_id": user_id, "car_id": car_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Car not found in favorites")
        
        # Update user statistics
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"favorite_count": -1}}
        )
        
        return {"status": "success", "message": "Removed from favorites"}
    
    except Exception as e:
        logger.error(f"Error removing from favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing from favorites: {str(e)}")

# Add this test endpoint to verify the router is working
@router.get("/test")
async def test_car_routes():
    """Test endpoint to verify car routes are working"""
    return {"status": "success", "message": "Car routes are working"}
