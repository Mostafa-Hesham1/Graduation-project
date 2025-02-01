from fastapi import APIRouter, HTTPException
from typing import List, Dict, Union
import pandas as pd
import logging
import random

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load the dataset
DATA_PATH = "C:/Users/Mostafa/Desktop/VehicleSouq/backend/expanded_car_data.csv"
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
