import pathlib
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
import torch
import numpy as np
import io
import logging
from PIL import Image
import sys
import os

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fix for the TryExcept import error - load the model differently
try:
    # Try using the ultralytics package directly instead of torch.hub
    from ultralytics import YOLO
    model = YOLO("yolov5s.pt")
    logger.info("Loaded YOLOv5 model using ultralytics package")
except ImportError:
    try:
        # Add YOLOv5 directory to path to avoid import conflicts
        sys.path.append(os.path.abspath(os.path.expanduser('~/.cache/torch/hub/ultralytics_yolov5_master')))
        # Load model manually
        model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True, trust_repo=True)
        logger.info("Loaded YOLOv5 model using torch.hub with trust_repo=True")
    except Exception as e:
        logger.error(f"Failed to load YOLOv5 model: {e}")
        model = None

class YoloResponse(BaseModel):
    car_detected: bool

@router.post("/check_car", response_model=YoloResponse)
async def check_car(file: UploadFile = File(...)):
    try:
        # Check if model loaded successfully
        if model is None:
            raise HTTPException(status_code=500, detail="YOLO model failed to load")
            
        # Read image from the uploaded file
        img_content = await file.read()
        img = Image.open(io.BytesIO(img_content))

        # Perform inference
        results = model(img)

        # Analyze the detections
        car_detected = False
        
        # Handle different result formats based on how the model was loaded
        if hasattr(results, 'xyxy'):  # torch.hub loading
            for result in results.xyxy[0]:
                class_id = int(result[5])
                confidence = float(result[4])
                if class_id == 2 and confidence > 0.5:  # Class ID 2 is for 'car' in COCO dataset
                    car_detected = True
                    break
        else:  # ultralytics YOLO loading
            for det in results[0].boxes.data:
                class_id = int(det[5]) if len(det) >= 6 else -1
                confidence = float(det[4]) if len(det) >= 5 else 0
                if class_id == 2 and confidence > 0.5:  # Class ID 2 is for 'car' in COCO dataset
                    car_detected = True
                    break

        return YoloResponse(car_detected=car_detected)
    except Exception as e:
        logging.error(f"An error occurred during YOLO detection: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))