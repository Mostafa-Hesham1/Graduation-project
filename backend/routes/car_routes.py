from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from database import db  # Ensure this is correctly importing your db connection
from .auth import get_current_user  # Use relative import
from typing import List
import os

router = APIRouter()

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

@router.post("/cars/list")
async def create_car_listing(
    car: CarListing,
    images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)  # Get the current user
):
    print("Received request to create car listing")  # Debugging line
    # Create a new car listing document
    new_car_listing = {
        "title": car.title,
        "make": car.make,
        "model": car.model,
        "year": car.year,
        "bodyType": car.bodyType,
        "fuelType": car.fuelType,
        "cc": car.cc,
        "location": car.location,
        "kilometers": car.kilometers,
        "transmissionType": car.transmissionType,
        "color": car.color,
        "condition": car.condition,
        "chatOption": car.chatOption,
        "price": car.price,
        "description": car.description,
        "user_id": current_user["_id"],  # Associate with the current user
    }

    # Insert the new car listing into the database
    result = await db.car_listings.insert_one(new_car_listing)

    # Handle image uploads
    for image in images:
        file_location = os.path.join(UPLOAD_DIRECTORY, image.filename)
        with open(file_location, "wb") as file:
            file.write(await image.read())  # Save the image to the specified location

    return {"message": "Car listing created successfully", "car_listing_id": str(result.inserted_id)}
