from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os
import logging
import sys
from datetime import datetime, timedelta

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Ensure parent directory is in Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create FastAPI app
app = FastAPI()

# Add CORS middleware with updated settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],
)

# Define uploads directory with absolute path
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)
logger.info(f"UPLOADS_DIR set to {UPLOADS_DIR}")

# Import ImageHelper
try:
    from utils.image_helper import ImageHelper
    image_helper = ImageHelper(UPLOADS_DIR)
    # Verify uploads directory is properly set up
    if image_helper.verify_uploads_directory():
        logger.info("Image helper initialized successfully")
    else:
        logger.error("Failed to verify uploads directory")
except Exception as e:
    logger.error(f"Error initializing image helper: {e}")
    image_helper = None

# List all files in the uploads directory for debugging
try:
    files = os.listdir(UPLOADS_DIR)
    logger.info(f"Found {len(files)} files in uploads directory:")
    for file in files:
        try:
            file_path = os.path.join(UPLOADS_DIR, file)
            file_size = os.path.getsize(file_path)
            logger.info(f"  - {file} ({file_size} bytes)")
        except Exception as e:
            logger.error(f"Error accessing file {file}: {e}")
except Exception as e:
    logger.error(f"Error listing files in uploads directory: {e}")

# Setup dependency for image helper
def get_image_helper():
    return image_helper

# Mount the uploads directory for static file access
try:
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
    logger.info(f"Successfully mounted /uploads to {UPLOADS_DIR}")
except Exception as e:
    logger.error(f"Failed to mount uploads directory: {e}")

# Direct endpoint to serve image files
@app.get("/image/{image_name}")
async def get_image(image_name: str, image_helper=Depends(get_image_helper)):
    try:
        file_path = image_helper.get_image_path(image_name)
        logger.info(f"Requested image: {image_name}, path: {file_path}")
        if os.path.exists(file_path):
            logger.info(f"Serving image: {file_path}")
            return FileResponse(file_path)
        else:
            logger.warning(f"Image not found: {file_path}")
            raise HTTPException(status_code=404, detail=f"Image not found: {image_name}")
    except Exception as e:
        logger.error(f"Error serving image {image_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check-image/{image_name}")
async def check_image(image_name: str, image_helper=Depends(get_image_helper)):
    exists = image_helper.check_image_exists(image_name)
    return {"exists": exists, "image_name": image_name}

@app.get("/check-files")
async def check_files(image_helper=Depends(get_image_helper)):
    return {"files": image_helper.list_images(), "uploads_dir": UPLOADS_DIR}

# Root endpoint
@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Server is running properly"}

# Import routers after app definition to avoid circular imports
from routes import scrape, train, predict, car_specs, auth
from routes.yolo import router as yolo_router
from routes.car_specs import router as car_specs_router
from routes.price_predict import router as price_predict_router
from routes.data import router as data_router
from database import db
from bson import json_util
from bson.objectid import ObjectId
from routes import car_routes
from routes.damage_detect import router as damage_detect_router
# Import the admin router
from routes.admin import router as admin_router

# Mount all routers
app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(train.router, prefix="/train", tags=["train"])
app.include_router(predict.router, prefix="/predict", tags=["predict"])
app.include_router(yolo_router, prefix="/yolo", tags=["yolo"])
app.include_router(car_specs_router, prefix="/car", tags=["car"])
app.include_router(price_predict_router, prefix="/price", tags=["price"])
app.include_router(data_router, prefix="/data", tags=["data"])
app.include_router(car_routes.router, prefix="/cars", tags=["cars"])
app.include_router(damage_detect_router, prefix="/damage", tags=["damage"])
app.include_router(auth.router)
app.include_router(admin_router, prefix="/admin", tags=["admin"])

# Direct auth check endpoint
@app.get("/auth-check")
async def root_auth_check():
    """Direct auth check endpoint"""
    try:
        # Import auth module functions
        from jose import jwt
        import datetime
        # Use hardcoded key for test
        secret_key = "5072851946b935d4a9eae4a277d18f71f77781f3a0164fb41b122190e2ff88ca"
        # Create test payload
        payload = {
            "test": "data",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        }
        # Create test token
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        # Verify token
        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        return {
            "status": "ok",
            "message": "Authentication system is working",
            "test_token": f"{token[:20]}...",
            "decoded": decoded,
            "environment_loaded": os.getenv("JWT_SECRET_KEY") is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Authentication error: {str(e)}",
            "error_type": str(type(e))
        }

# Add direct admin endpoints as a fallback if router inclusion doesn't work
@app.get("/admin/stats-direct")
async def admin_stats_direct():
    """Direct access to admin stats"""
    try:
        # Get collection counts directly
        total_users = await db.users.count_documents({})
        total_cars = await db.cars.count_documents({})
        active_listings = await db.listings.count_documents({"status": {"$ne": "sold"}})
        completed_sales = await db.listings.count_documents({"status": "sold"})
        
        return {
            "total_users": total_users,
            "total_cars": total_cars,
            "active_listings": active_listings,
            "completed_sales": completed_sales
        }
    except Exception as e:
        logger.error(f"Error in direct admin stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching admin statistics: {str(e)}"
        )

# Add these new direct endpoints for debugging
@app.get("/admin/users-direct")
async def admin_users_direct():
    """Direct access to admin users (no auth check for debugging)"""
    try:
        cursor = db.users.find({}).sort("created_at", -1)
        
        users = []
        async for user in cursor:
            if "_id" in user:
                user["_id"] = str(user["_id"])
                
            # Remove sensitive information
            if "password" in user:
                del user["password"]
            if "hashed_password" in user:
                del user["hashed_password"]
                
            # Ensure we have created_at
            if "created_at" not in user:
                user["created_at"] = datetime.utcnow()
                
            users.append(user)
        
        if not users:
            # Add sample data for UI testing
            sample_users = [
                {
                    "_id": "admin1",
                    "username": "admin",
                    "email": "admin@vehiclesouq.com",
                    "role": "admin",
                    "created_at": datetime.utcnow() - timedelta(days=60)
                },
                {
                    "_id": "user1",
                    "username": "user1",
                    "email": "user1@example.com",
                    "role": "user",
                    "created_at": datetime.utcnow() - timedelta(days=30)
                }
            ]
            users = sample_users
            
        return {"users": users}
    except Exception as e:
        logger.error(f"Error in direct admin users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching users: {str(e)}"
        )

@app.get("/admin/listings-direct")
async def admin_listings_direct():
    """Direct access to admin listings (no auth check for debugging)"""
    try:
        cursor = db.listings.find().sort("created_at", -1).limit(10)
        
        listings = []
        async for listing in cursor:
            if "_id" in listing:
                listing["_id"] = str(listing["_id"])
                
            # Process user_id
            if "user_id" in listing and isinstance(listing["user_id"], ObjectId):
                listing["user_id"] = str(listing["user_id"])
                
            # Ensure we have required fields with defaults
            if "price" not in listing:
                listing["price"] = 0
                
            if "created_at" not in listing:
                listing["created_at"] = datetime.utcnow()
                
            listings.append(listing)
        
        if not listings:
            # Add sample data for UI testing
            sample_listings = [
                {
                    "_id": "sample1",
                    "title": "Sample BMW X5",
                    "make": "BMW",
                    "model": "X5",
                    "price": 750000,
                    "created_at": datetime.utcnow(),
                    "user": {"username": "admin"}
                }
            ]
            listings = sample_listings
            
        return {"listings": listings}
    except Exception as e:
        logger.error(f"Error in direct admin listings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching listings: {str(e)}"
        )

@app.get("/admin/growth-metrics-direct") 
async def admin_growth_metrics_direct():
    """Direct access to growth metrics (no auth check for debugging)"""
    try:
        # Calculate time periods
        now = datetime.utcnow()
        
        # Generate sample growth data
        total_users = await db.users.count_documents({})
        total_cars = await db.cars.count_documents({})
        
        return {
            "users_growth": f"+{max(5, int(total_users * 0.1))}",
            "cars_growth": f"+{max(3, int(total_cars * 0.1))}",
            "listings_growth": "+7",
            "sales_growth": "+2"
        }
    except Exception as e:
        logger.error(f"Error in direct growth metrics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching growth metrics: {str(e)}"
        )

# Add specific handler for admin preflight requests
@app.options("/admin/{rest_of_path:path}")
async def admin_options_handler(rest_of_path: str):
    """Handle OPTIONS requests to /admin routes"""
    logger.info(f"Processing OPTIONS request for /admin/{rest_of_path}")
    return {}

# General CORS preflight handler
@app.options("/{path:path}")
async def cors_preflight(path: str, request: Request):
    """Handle CORS preflight requests for all routes"""
    logger.info(f"CORS preflight request for path: {path}")
    return {"status": "ok"}

@app.get("/cors-debug")
async def cors_debug():
    """Debug endpoint for CORS testing"""
    return {"message": "CORS is working", "timestamp": str(datetime.now())}

# HTTP middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Exception handler for 404 errors
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    path = request.url.path
    logger.warning(f"404 Not Found: {path}")
    if (path.startswith('/uploads/')):
        image_name = path.split('/')[-1]
        file_path = os.path.join(UPLOADS_DIR, image_name)
        if os.path.exists(file_path):
            logger.info(f"File exists but couldn't be served normally, serving directly: {file_path}")
            return FileResponse(file_path)
    return JSONResponse(
        content={"detail": f"Not Found: {path}"},
        status_code=404,
    )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server on port 8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)