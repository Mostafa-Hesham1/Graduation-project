from fastapi import APIRouter, HTTPException
from typing import List, Dict, Union
import pandas as pd
import logging
import random
import json
import os

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load the dataset
DATA_PATH = "C:/Users/mosta/OneDrive/Desktop/VehicleSouq (2)/VehicleSouq/backend/expanded_car_data.csv"
try:
    df = pd.read_csv(DATA_PATH)
    logging.info(f"Dataset loaded successfully from: {DATA_PATH}")
except Exception as e:
    logging.error(f"Failed to load dataset from: {DATA_PATH}, error: {str(e)}")
    raise HTTPException(status_code=500, detail="Failed to load dataset")

@router.get("/make", response_model=List[Dict[str, Union[str, int]]])
async def get_make_data():
    try:
        make_counts = df['Make'].value_counts().reset_index()
        make_counts.columns = ['Make', 'Count']
        data = make_counts.to_dict(orient='records')
        return data
    except Exception as e:
        logging.error(f"Failed to process make data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process make data")

@router.get("/model", response_model=List[Dict[str, Union[str, int]]])
async def get_model_data():
    try:
        logging.info("Processing model data request")
        model_counts = df['Model'].value_counts().reset_index()
        model_counts.columns = ['Model', 'Count']
        data = model_counts.to_dict(orient='records')
        logging.info(f"Model data processed successfully: {data}")
        return data
    except Exception as e:
        logging.error(f"Failed to process model data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process model data")

@router.get("/fuel", response_model=List[Dict[str, Union[str, int]]])
async def get_fuel_data():
    try:
        logging.info("Processing fuel data request")
        fuel_counts = df['FuelType'].value_counts().reset_index()
        fuel_counts.columns = ['FuelType', 'Count']
        data = fuel_counts.to_dict(orient='records')
        logging.info(f"Fuel data processed successfully: {data}")
        return data
    except Exception as e:
        logging.error(f"Failed to process fuel data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process fuel data")

@router.get("/yearly", response_model=List[Dict[str, Union[str, int]]])
async def get_yearly_data():
    try:
        logging.info("Processing yearly data request")
        yearly_counts = df['Year'].value_counts().reset_index()
        yearly_counts.columns = ['Year', 'Count']
        yearly_counts = yearly_counts.sort_values(by='Year')
        data = yearly_counts.to_dict(orient='records')
        logging.info(f"Yearly data processed successfully: {data}")
        return data
    except Exception as e:
        logging.error(f"Failed to process yearly data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process yearly data")

@router.get("/random", response_model=List[Dict[str, Union[str, int, float]]])
async def get_random_data():
    try:
        logging.info("Fetching all data from dataset")
        all_data = df.to_dict(orient='records')
        logging.info(f"All data fetched successfully: {len(all_data)} records")
        return all_data
    except Exception as e:
        logging.error(f"Failed to fetch all data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch all data")

@router.get("/all")
async def get_all_data():
    """Endpoint to get all scraped data"""
    try:
        # Try to load data from a saved file
        json_file_path = os.path.join(os.path.dirname(__file__), '../dataset/car_data.json')
        
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            return {"data": data, "count": len(data)}
        else:
            # If file doesn't exist, return empty data
            logging.warning(f"Data file not found at {json_file_path}")
            return {"data": [], "count": 0, "message": "No data available"}
    
    except Exception as e:
        logging.error(f"Error fetching data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
