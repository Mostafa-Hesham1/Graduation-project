from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import numpy as np
import cv2
import base64
from io import BytesIO
import os
import logging
import traceback
from PIL import Image
import io
import torch

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
    model = YOLO(MODEL_PATH)
    logger.info(f"Car damage segmentation model loaded successfully from: {MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load damage segmentation model: {e}")
    model = None

def preprocess_image(img, reduce_reflection=True, enhance_contrast=True):
    """
    Preprocess the image to improve damage detection accuracy
    
    Args:
        img: Input image (numpy array)
        reduce_reflection: Whether to apply reflection reduction
        enhance_contrast: Whether to enhance image contrast
        
    Returns:
        Preprocessed image
    """
    # Convert to HSV color space to work with brightness
    if img.max() <= 1.0:
        img = (img * 255).astype(np.uint8)
    
    # Make a copy of the original image
    processed_img = img.copy()
    
    if reduce_reflection:
        # Convert to HSV color space
        hsv = cv2.cvtColor(processed_img, cv2.COLOR_BGR2HSV)
        
        # Identify bright areas (potential reflections)
        _, s, v = cv2.split(hsv)
        bright_mask = (v > 220) & (s < 30)  # High value and low saturation = white/bright reflection
        
        # Dilate the mask to cover reflection areas better
        kernel = np.ones((5, 5), np.uint8)
        bright_mask = cv2.dilate(bright_mask.astype(np.uint8), kernel, iterations=1)
        
        # Apply a median blur to just the reflection areas to reduce their impact
        reflection_reduced = cv2.medianBlur(processed_img, 7)
        
        # Create a mask for blending the processed and original image
        mask_3d = np.stack([bright_mask, bright_mask, bright_mask], axis=2)
        
        # Blend original image with processed where reflections were detected
        processed_img = np.where(mask_3d, reflection_reduced, processed_img)
    
    if enhance_contrast:
        # Convert to LAB color space for better contrast enhancement
        lab = cv2.cvtColor(processed_img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        # Merge the CLAHE enhanced L-channel back with the a and b channels
        limg = cv2.merge((cl, a, b))
        
        # Convert back to BGR color space
        processed_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    return processed_img

def custom_visualize(image, results, score_threshold=0.25, mask_threshold=0.5, alpha=0.5):
    """
    Overlays segmentation masks with specified colors for each damage type onto the input image.
    
    Args:
        image: Original image
        results: YOLOv8 inference results
        score_threshold: Minimum confidence score to display
        mask_threshold: Threshold for mask pixels
        alpha: Transparency of the overlay
        
    Returns:
        Annotated image with damage masks
    """
    img = image.copy()
    if img.max() <= 1.0:
        img = (img * 255).astype(np.uint8)
    
    orig_h, orig_w = img.shape[:2]
    
    if hasattr(results[0].boxes, 'conf'):
        # Get predictions
        scores = results[0].boxes.conf.cpu().numpy()
        labels = results[0].boxes.cls.cpu().numpy().astype(int)
        
        # Check if segmentation masks exist
        if hasattr(results[0], 'masks') and results[0].masks is not None:
            masks = results[0].masks.data.cpu().numpy()
            
            # Process masks based on dimensionality
            if masks.ndim == 4:
                masks = masks[:, 0, :, :]  # squeeze to [N, H_mask, W_mask]
            
            # Overlay each mask
            for i in range(len(scores)):
                if scores[i] < score_threshold:
                    continue
                    
                cls = labels[i]
                color = COLOR_MAPPING.get(cls, (255, 255, 255))  # default to white if not found
                mask = masks[i]
                
                # Resize mask if needed
                if mask.shape != (orig_h, orig_w):
                    mask_resized = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
                else:
                    mask_resized = mask
                    
                binary_mask = mask_resized > mask_threshold
                
                # Create overlay
                overlay = np.zeros_like(img, dtype=np.uint8)
                overlay[binary_mask] = color
                
                # Blend the overlay with original image
                img = cv2.addWeighted(img, 1.0, overlay, alpha, 0)
    
    return img

@router.post("/detect")
async def detect_damage(
    file: UploadFile = File(...),
    reduce_reflection: bool = Form(True),
    enhance_contrast: bool = Form(True),
    confidence_threshold: float = Form(0.25)
):
    """
    Detects and segments car damage in the uploaded image.
    Now with options to handle reflections and improve small damage detection.
    """
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Damage detection model not loaded")
        
        # Read image file
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Convert PIL image to numpy array for OpenCV processing
        np_img = np.array(pil_img)
        
        # Apply preprocessing to handle reflections and enhance contrast
        processed_img = preprocess_image(
            np_img, 
            reduce_reflection=reduce_reflection,
            enhance_contrast=enhance_contrast
        )
        
        # Convert original and processed images to base64 for response
        _, buffer_orig = cv2.imencode('.jpg', np_img)
        orig_img_str = base64.b64encode(buffer_orig).decode()
        
        _, buffer_processed = cv2.imencode('.jpg', processed_img)
        processed_img_str = base64.b64encode(buffer_processed).decode()
        
        # Run inference with the segmentation model on processed image
        # Use a lower confidence threshold to detect smaller damages
        results = model(processed_img, conf=confidence_threshold)
        
        # Visualize results with custom segmentation masks
        annotated_img = custom_visualize(processed_img, results, score_threshold=confidence_threshold)
        
        # Convert annotated image to base64 for response
        _, buffer_full = cv2.imencode('.jpg', annotated_img)
        annotated_img_str = base64.b64encode(buffer_full).decode()
        
        # Process results: detections and damage counts
        detections = []
        damage_counts = {}
        damage_crops = []
        
        if hasattr(results[0].boxes, 'conf'):
            scores = results[0].boxes.conf.cpu().numpy()
            labels = results[0].boxes.cls.cpu().numpy().astype(int)
            boxes = results[0].boxes.xyxy.cpu().numpy()
            
            for i in range(len(scores)):
                confidence = float(scores[i])
                if confidence < confidence_threshold:  # Skip low confidence detections
                    continue
                    
                class_id = int(labels[i])
                class_name = CLASS_NAMES[class_id]
                x1, y1, x2, y2 = [float(x) for x in boxes[i]]
                
                # Update damage count
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
                
                # Crop the detected damage region 
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                crop = processed_img[y1:y2, x1:x2]
                
                # Add mask overlay to crop if available
                if hasattr(results[0], 'masks') and results[0].masks is not None:
                    masks = results[0].masks.data.cpu().numpy()
                    if masks.ndim == 4:
                        masks = masks[:, 0, :, :]
                    
                    if i < len(masks):  # Ensure there's a mask for this detection
                        mask = masks[i]
                        if mask.shape != (processed_img.shape[0], processed_img.shape[1]):
                            mask = cv2.resize(mask, (processed_img.shape[1], processed_img.shape[0]), 
                                             interpolation=cv2.INTER_NEAREST)
                        
                        # Apply color to the cropped region based on damage type
                        color = COLOR_MAPPING.get(class_id, (255, 255, 255))
                        mask_crop = mask[y1:y2, x1:x2] > 0.5
                        
                        # Create highlight overlay for the crop
                        overlay = np.zeros_like(crop, dtype=np.uint8)
                        overlay[mask_crop] = color
                        
                        # Add semi-transparent overlay
                        crop = cv2.addWeighted(crop, 1.0, overlay, 0.4, 0)
                
                # Encode crop to base64
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
