"""
Script to find valid car IDs in the database for performance testing
"""
import requests
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API base URL
BASE_URL = "http://localhost:8000"

def find_valid_car_ids():
    """Find valid car IDs by fetching car listings"""
    try:
        # Try to get car listings
        response = requests.get(f"{BASE_URL}/api/cars/listings?limit=5")
        response.raise_for_status()
        
        data = response.json()
        
        if "listings" not in data or not data["listings"]:
            logger.warning("No car listings found")
            return []
        
        # Extract car IDs from the listings
        car_ids = []
        for listing in data["listings"]:
            if "_id" in listing:
                car_ids.append(listing["_id"])
                logger.info(f"Found car ID: {listing['_id']}")
        
        if car_ids:
            logger.info(f"Found {len(car_ids)} valid car IDs")
            
            # Update settings.py with the found IDs
            update_settings_file(car_ids)
            
            return car_ids
        else:
            logger.warning("No car IDs found in the listings")
            return []
            
    except Exception as e:
        logger.error(f"Error finding valid car IDs: {str(e)}")
        return []

def update_settings_file(car_ids):
    """Update the settings.py file with valid car IDs"""
    try:
        settings_file = "config/settings.py"
        with open(settings_file, 'r') as f:
            content = f.read()
        
        # Replace the SAMPLE_CAR_IDS line
        import re
        new_ids_str = json.dumps(car_ids)
        new_content = re.sub(
            r'SAMPLE_CAR_IDS = \[.*?\]', 
            f'SAMPLE_CAR_IDS = {new_ids_str}',
            content
        )
        
        # Write updated content
        with open(settings_file, 'w') as f:
            f.write(new_content)
            
        logger.info(f"Updated settings file with valid car IDs: {car_ids}")
    except Exception as e:
        logger.error(f"Error updating settings file: {str(e)}")

if __name__ == "__main__":
    logger.info("Searching for valid car IDs...")
    car_ids = find_valid_car_ids()
    
    if car_ids:
        logger.info(f"Found {len(car_ids)} valid car IDs: {car_ids}")
        logger.info("Updated settings.py with these IDs")
        logger.info("Now you can run your performance tests with valid car IDs")
    else:
        logger.error("Could not find any valid car IDs. Your performance tests may fail.")
        logger.info("Please manually add some car listings to the system first.")
