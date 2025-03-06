import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_required_directories():
    # Create dataset directory
    dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset")
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        logger.info(f"Created dataset directory at: {dataset_dir}")
    else:
        logger.info(f"Dataset directory already exists at: {dataset_dir}")
    
    # Create empty car_data.json if it doesn't exist
    car_data_path = os.path.join(dataset_dir, "car_data.json")
    if not os.path.exists(car_data_path):
        # Create an empty array as initial data
        with open(car_data_path, 'w', encoding='utf-8') as f:
            json.dump([], f)
        logger.info(f"Created empty car_data.json at: {car_data_path}")
    else:
        logger.info(f"car_data.json already exists at: {car_data_path}")
    
    # Create uploads directory
    uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        logger.info(f"Created uploads directory at: {uploads_dir}")
    else:
        logger.info(f"Uploads directory already exists at: {uploads_dir}")

if __name__ == "__main__":
    create_required_directories()
