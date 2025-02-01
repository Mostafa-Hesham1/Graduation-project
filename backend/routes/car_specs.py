import logging
from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

@router.get("/cars")
async def get_all_cars():
    logging.info("Received request to fetch all car specifications")
    try:
        # Load car specifications from the JSON file
        json_file_path = os.path.join(os.path.dirname(__file__), '../dataset/car_specs.json')
        with open(json_file_path, 'r') as file:
            cars = json.load(file)  # Load the JSON data
        
        if cars:
            logging.info("Successfully retrieved all car specifications")
            return cars
        else:
            logging.error("No car specifications found")
            raise HTTPException(status_code=404, detail="No car specifications found")
    except Exception as e:
        logging.error(f"Error fetching car specifications: {e}")
        raise HTTPException(status_code=500, detail="Error fetching car specifications")

@router.get("/car/id/{car_id}")
async def get_car_by_id(car_id: str):
    logging.info(f"Received request for car ID: {car_id}")
    try:
        # Convert the string ID to an ObjectId
        object_id = ObjectId(car_id)
        logging.info(f"Converted to ObjectId: {object_id}")
        
        # Fetch the car details from MongoDB using the ObjectId
        car_detail = await db.car_specs.find_one({"_id": object_id})

        if car_detail:
            logging.info(f"Found car details for ID: {car_id}")
            return car_detail
        else:
            logging.error("Car details not found")
            raise HTTPException(status_code=404, detail="Car details not found")
    except Exception as e:
        logging.error(f"Error fetching car details by ID: {e}")
        raise HTTPException(status_code=500, detail="Error fetching car details")

@router.get("/car/name/{car_name}")
async def get_car_by_name(car_name: str):
    logging.info(f"Received request for car name: {car_name}")
    try:
        # Load car specifications from the JSON file
        json_file_path = os.path.join(os.path.dirname(__file__), '../dataset/car_specs.json')
        with open(json_file_path, 'r') as file:
            cars = json.load(file)  # Load the JSON data
        
        # Find the car with the matching title (case-insensitive)
        for car in cars:
            if car["Title"].lower() == car_name.lower():  # Case-insensitive comparison
                logging.info(f"Found car details for name: {car_name}")
                return {"message": "Car found", "car_specs": car}
        
        logging.error("Car details not found")
        return {"message": "Car not found"}
    except Exception as e:
        logging.error(f"Error fetching car details by name: {e}")
        raise HTTPException(status_code=500, detail="Error fetching car details")

@router.post("/identify_car")
async def identify_car(car_name: str):
    logging.info(f"Identifying car: {car_name}")
    # Call the existing function to get car specs by name
    return await get_car_by_name(car_name)
