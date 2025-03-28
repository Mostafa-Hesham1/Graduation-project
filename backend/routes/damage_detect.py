from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import os
import logging
import traceback
from PIL import Image
import io
import torch
from typing import List, Dict, Union, Optional

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Update path to the segmentation model
MODEL_PATH = r"C:\Users\mosta\OneDrive\Desktop\VehicleSouq (2)\VehicleSouq\backend\ML-Models\CarDamageModels\yolov8l_seg_car_damage.pt"

# Define the class names and color mapping for visualization
CLASS_NAMES = ['dent', 'scratch', 'crack', 'glass shatter', 'lamp broken', 'tire flat']

# Color mapping in BGR format (for OpenCV)
COLOR_MAPPING = {
    0: (0, 0, 255),     # dent - red
    1: (0, 255, 0),     # scratch - green
    2: (255, 0, 0),     # crack - blue
    3: (0, 255, 255),   # glass shatter - yellow
    4: (255, 0, 255),   # lamp broken - magenta
    5: (255, 255, 0)    # tire flat - cyan
}

# Initialize the model
try:
    # Damage detection model
    model = YOLO(MODEL_PATH)
    logger.info(f"Car damage segmentation model loaded successfully from: {MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

def preprocess_image(img, reduce_reflection=False, enhance_contrast=False):
    """
    Basic preprocessing to improve damage detection accuracy.
    """
    # Convert to valid format
    if img.max() <= 1.0:
        img = (img * 255).astype(np.uint8)
    
    # Make a copy of the original image
    processed_img = img.copy()
    
    # Step 1: Reduce reflections if requested
    if reduce_reflection:
        hsv = cv2.cvtColor(processed_img, cv2.COLOR_BGR2HSV)
        _, s, v = cv2.split(hsv)
        bright_mask = (v > 220) & (s < 30)
        kernel = np.ones((5, 5), np.uint8)
        bright_mask = cv2.dilate(bright_mask.astype(np.uint8), kernel, iterations=1)
        reflection_reduced = cv2.medianBlur(processed_img, 7)
        mask_3d = np.stack([bright_mask, bright_mask, bright_mask], axis=2)
        processed_img = np.where(mask_3d, reflection_reduced, processed_img)
    
    # Step 2: Enhance contrast if requested
    if enhance_contrast:
        lab = cv2.cvtColor(processed_img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        processed_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    return processed_img

def custom_visualize(image, results, score_threshold=0.25, mask_threshold=0.5, alpha=0.5):
    """
    Basic visualization for detected damages using segmentation masks.
    """
    img = image.copy()
    if img.max() <= 1.0:
        img = (img * 255).astype(np.uint8)
    
    orig_h, orig_w = img.shape[:2]
    
    if hasattr(results[0].boxes, 'conf'):
        scores = results[0].boxes.conf.cpu().numpy()
        labels = results[0].boxes.cls.cpu().numpy().astype(int)
        
        if hasattr(results[0], 'masks') and results[0].masks is not None:
            masks = results[0].masks.data.cpu().numpy()
            if masks.ndim == 4:
                masks = masks[:, 0, :, :]
            
            for i in range(len(scores)):
                if scores[i] < score_threshold:
                    continue
                
                cls = labels[i]
                color = COLOR_MAPPING.get(cls, (255, 255, 255))
                mask = masks[i]
                
                if mask.shape != (orig_h, orig_w):
                    mask_resized = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
                else:
                    mask_resized = mask
                
                binary_mask = mask_resized > mask_threshold
                
                overlay = np.zeros_like(img, dtype=np.uint8)
                overlay[binary_mask] = color
                img = cv2.addWeighted(img, 1.0, overlay, alpha, 0)
    
    return img

@router.post("/detect")
async def detect_damage(
    file: UploadFile = File(...),
    reduce_reflection: bool = Form(False),
    enhance_contrast: bool = Form(False),
    confidence_threshold: float = Form(0.25)
):
    """
    Detects and segments car damage in the uploaded image.
    """
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Damage detection model not loaded")
        
        contents = await file.read()
        
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        np_img = np.array(pil_img)
        
        processed_img = preprocess_image(
            np_img, 
            reduce_reflection=reduce_reflection,
            enhance_contrast=enhance_contrast
        )
        
        _, buffer_orig = cv2.imencode('.jpg', np_img)
        orig_img_str = base64.b64encode(buffer_orig).decode()
        
        _, buffer_processed = cv2.imencode('.jpg', processed_img)
        processed_img_str = base64.b64encode(buffer_processed).decode()
        
        results = model(processed_img, conf=confidence_threshold)
        
        annotated_img = custom_visualize(
            processed_img, 
            results, 
            score_threshold=confidence_threshold
        )
        
        _, buffer_full = cv2.imencode('.jpg', annotated_img)
        annotated_img_str = base64.b64encode(buffer_full).decode()
        
        detections = []
        damage_counts = {}
        damage_crops = []
        
        if hasattr(results[0].boxes, 'conf'):
            scores = results[0].boxes.conf.cpu().numpy()
            labels = results[0].boxes.cls.cpu().numpy().astype(int)
            boxes = results[0].boxes.xyxy.cpu().numpy()
            
            for i in range(len(scores)):
                confidence = float(scores[i])
                if confidence < confidence_threshold:
                    continue
                    
                class_id = int(labels[i])
                class_name = CLASS_NAMES[class_id]
                x1, y1, x2, y2 = [float(x) for x in boxes[i]]
                
                if class_name in damage_counts:
                    damage_counts[class_name] += 1
                else:
                    damage_counts[class_name] = 1
                
                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2]
                })
                
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                pad = 10
                x1 = max(0, x1 - pad)
                y1 = max(0, y1 - pad)
                x2 = min(processed_img.shape[1], x2 + pad)
                y2 = min(processed_img.shape[0], y2 + pad)
                
                crop = processed_img[y1:y2, x1:x2]
                
                _, crop_buffer = cv2.imencode('.jpg', crop)
                crop_str = base64.b64encode(crop_buffer).decode()
                
                damage_crops.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2],
                    "crop": crop_str
                })
        
        return {
            "status": "success",
            "message": "Car damage detected",
            "is_video": False,
            "original_image": orig_img_str,
            "processed_image": processed_img_str,
            "annotated_image": annotated_img_str,
            "detections": detections,
            "damage_counts": damage_counts,
            "damage_crops": damage_crops,
            "preprocessing_applied": {
                "reflection_reduction": reduce_reflection,
                "contrast_enhancement": enhance_contrast
            }
        }
    
    except Exception as e:
        logger.error(f"Error detecting damage: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error detecting damage: {str(e)}")
