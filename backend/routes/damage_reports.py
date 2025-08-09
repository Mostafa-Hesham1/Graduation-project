from fastapi import APIRouter, Depends, HTTPException, Body, Path, Query
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from bson import ObjectId
import logging

from database import db
from routes.auth import get_current_user

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/create-report")
async def create_damage_report(
    report_data: Dict[str, Any] = Body(...),
    user = Depends(get_current_user)
):
    """Create a new damage analysis report"""
    try:
        user_id = str(user["_id"])
        
        # Create report structure
        report = {
            "report_id": str(uuid.uuid4()),
            "user_id": user_id,
            "car_id": report_data.get("car_id"),
            "car_title": report_data.get("car_title", "Unknown Vehicle"),
            "total_images": report_data.get("total_images", 0),
            "image_results": [],
            "total_damages": 0,
            "status": "in_progress",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Save to database
        result = await db.damage_reports.insert_one(report)
        
        return {
            "status": "success",
            "message": "Damage report created",
            "report_id": report["report_id"]
        }
        
    except Exception as e:
        logger.error(f"Error creating damage report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating damage report: {str(e)}")

@router.post("/update-report/{report_id}/image/{image_index}")
async def update_report_image(
    report_id: str = Path(...),
    image_index: int = Path(...),
    image_data: Dict[str, Any] = Body(...),
    user = Depends(get_current_user)
):
    """Update a report with image analysis results"""
    try:
        user_id = str(user["_id"])
        
        # Find the report
        report = await db.damage_reports.find_one({
            "report_id": report_id,
            "user_id": user_id
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Add or update image result
        image_result = {
            "image_index": image_index,
            "annotated_image": image_data.get("annotated_image"),
            "detections": image_data.get("detections", []),
            "damage_counts": image_data.get("damage_counts", {}),
            "damage_crops": image_data.get("damage_crops", []),
            "total_damages": image_data.get("total_damages", 0)
        }
        
        # Check if we need to add or update
        image_results = report.get("image_results", [])
        
        # Find the index of existing image result with the same image_index
        existing_index = next((i for i, item in enumerate(image_results) 
                              if item.get("image_index") == image_index), None)
        
        if existing_index is not None:
            # Update existing image result
            image_results[existing_index] = image_result
        else:
            # Add new image result
            image_results.append(image_result)
        
        # Update the report
        await db.damage_reports.update_one(
            {"report_id": report_id},
            {
                "$set": {
                    "image_results": image_results,
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        return {
            "status": "success",
            "message": f"Image {image_index} analysis added to report"
        }
        
    except Exception as e:
        logger.error(f"Error updating report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating report: {str(e)}")

@router.post("/complete-report/{report_id}")
async def complete_damage_report(
    report_id: str = Path(...),
    completion_data: Dict[str, Any] = Body(...),
    user = Depends(get_current_user)
):
    """Mark a damage report as complete and set total damages"""
    try:
        user_id = str(user["_id"])
        
        # Find the report
        report = await db.damage_reports.find_one({
            "report_id": report_id,
            "user_id": user_id
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update the report
        await db.damage_reports.update_one(
            {"report_id": report_id},
            {
                "$set": {
                    "total_damages": completion_data.get("total_damages", 0),
                    "status": "completed",
                    "updated_at": datetime.now().isoformat()
                }
            }
        )
        
        return {
            "status": "success",
            "message": "Report completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error completing report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error completing report: {str(e)}")

@router.delete("/report/{report_id}")
async def delete_damage_report(
    report_id: str = Path(...),
    user = Depends(get_current_user)
):
    """Delete a specific damage report"""
    try:
        user_id = str(user["_id"])
        
        # Find and verify ownership of the report
        report = await db.damage_reports.find_one({
            "report_id": report_id,
            "user_id": user_id
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found or you don't have permission to delete it")
        
        # Delete the report
        result = await db.damage_reports.delete_one({
            "report_id": report_id,
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "status": "success",
            "message": "Damage report deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting damage report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting damage report: {str(e)}")

@router.get("/reports")
async def get_user_damage_reports(
    limit: Optional[int] = Query(50, description="Maximum number of reports to return"),
    skip: Optional[int] = Query(0, description="Number of reports to skip"),
    user = Depends(get_current_user)
):
    """Get all damage reports for a user with pagination and optimized data"""
    try:
        user_id = str(user["_id"])
        
        logger.info(f"Fetching damage reports for user {user_id} with limit={limit}, skip={skip}")
        
        # Attempt to create index first to optimize future queries
        try:
            await db.damage_reports.create_index([("user_id", 1), ("created_at", -1)])
            logger.info("Index created or already exists for damage_reports collection")
        except Exception as idx_err:
            logger.warning(f"Could not create index: {str(idx_err)}")
        
        # Try multiple approaches until one works
        
        # Approach 1: Retrieve without sorting, then sort in memory
        try:
            # Get the documents without sorting
            reports_cursor = db.damage_reports.find(
                {"user_id": user_id},
                {"image_results": 0}  # Exclude heavy field
            ).limit(100)  # Increase limit to get more documents
            
            # Convert to list and sort in Python
            reports = await reports_cursor.to_list(length=None)
            reports.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            # Apply skip and limit after sorting
            reports = reports[skip:skip+limit]
            
            logger.info(f"Successfully fetched and sorted {len(reports)} reports in memory")
        except Exception as e1:
            logger.warning(f"In-memory sort approach failed: {str(e1)}")
            
            # Approach 2: Use a basic find with no options
            try:
                reports_cursor = db.damage_reports.find({"user_id": user_id}, {"image_results": 0})
                reports = await reports_cursor.to_list(length=None)
                logger.info(f"Basic find approach succeeded with {len(reports)} reports")
            except Exception as e2:
                logger.warning(f"Basic find approach failed: {str(e2)}")
                
                # Approach 3: Last resort - return empty list
                reports = []
                logger.warning("All approaches failed. Returning empty list.")
        
        total_count = await db.damage_reports.count_documents({"user_id": user_id})
        
        # Add image_results_count for each report
        for report in reports:
            if "_id" in report and isinstance(report["_id"], ObjectId):
                report["_id"] = str(report["_id"])
            # Get image_results_count from DB if needed
            image_results_count = 0
            if "image_results_count" in report:
                image_results_count = report["image_results_count"]
            elif "image_results" in report:
                image_results_count = len(report["image_results"])
            report["image_results_count"] = image_results_count
            
        return {
            "status": "success",
            "reports": reports,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "skip": skip,
                "has_more": skip + len(reports) < total_count
            }
        }
    except Exception as e:
        logger.error(f"Error fetching damage reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching damage reports: {str(e)}")

@router.get("/report/{report_id}")
async def get_damage_report(
    report_id: str = Path(...),
    user = Depends(get_current_user)
):
    """Get details of a specific damage report"""
    try:
        user_id = str(user["_id"])
        # Get the report with all fields, including image_results
        report = await db.damage_reports.find_one({
            "report_id": report_id,
            "user_id": user_id
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Convert ObjectId to string
        if "_id" in report and isinstance(report["_id"], ObjectId):
            report["_id"] = str(report["_id"])
        
        # Always include image_results (empty list if missing)
        if "image_results" not in report or not isinstance(report["image_results"], list):
            report["image_results"] = []
            
        # Log the report structure for debugging
        logger.info(f"Fetched report {report_id} with {len(report.get('image_results', []))} image results")
            
        return {
            "status": "success",
            "report": report
        }
    except Exception as e:
        logger.error(f"Error fetching damage report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching damage report: {str(e)}")
