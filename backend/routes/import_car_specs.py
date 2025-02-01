import json
import asyncio
from database import db  # Use absolute import to access the database module
import os

async def import_car_specs():
    # Load the car specifications from the JSON file
    json_file_path = os.path.join(os.path.dirname(__file__), '../dataset/car_specs.json')
    with open(json_file_path, 'r') as file:
        car_specs = json.load(file)
    
    # Insert the data into the MongoDB collection
    result = await db.car_specs.insert_many(car_specs)
    print("Car specifications imported successfully with ids: {}".format(result.inserted_ids))

# Run the import function
if __name__ == "__main__":
    try:
        asyncio.run(import_car_specs())
    except RuntimeError as e:
        if "This event loop is already running" in str(e):
            # If the event loop is already running, use the current loop
            loop = asyncio.get_event_loop()
            loop.run_until_complete(import_car_specs()) 