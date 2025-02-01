import pathlib
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
import torch
import numpy as np
import io
import logging
from PIL import Image

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

class YoloResponse(BaseModel):
    car_detected: bool

@router.post("/check_car", response_model=YoloResponse)
async def check_car(file: UploadFile = File(...)):
    try:
        # Read image from the uploaded file
        img_content = await file.read()
        img = Image.open(io.BytesIO(img_content))

        # Perform inference
        results = model(img)

        # Analyze the detections
        car_detected = False
        for result in results.xyxy[0]:
            class_id = int(result[5])
            confidence = float(result[4])
            if class_id == 2 and confidence > 0.5:  # Class ID 2 is for 'car' in COCO dataset
                car_detected = True
                break

        return YoloResponse(car_detected=car_detected)
    except Exception as e:
        logging.error(f"An error occurred during YOLO detection: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))