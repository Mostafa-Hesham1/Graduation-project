from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import scrape, train, predict, car_specs, auth, car_routes  # Import the car_routes
from routes.yolo import router as yolo_router  # Ensure correct import for YOLO router
from routes.car_specs import router as car_specs_router  # Import the car specs router
from routes.price_predict import router as price_predict_router  # Import the price prediction router
from routes.data import router as data_router  # Import the data router
from database import db  # Import the database connection
import logging


logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(train.router, prefix="/train", tags=["train"])
app.include_router(predict.router, prefix="/predict", tags=["predict"])  # Change the prefix to "/predict"
app.include_router(yolo_router, prefix="/yolo", tags=["yolo"])  # Ensure correct router inclusion
app.include_router(car_specs_router, prefix="/car", tags=["car"])  # Include the car specs router
app.include_router(price_predict_router, prefix="/price", tags=["price"])  # Include the price prediction router
app.include_router(data_router, prefix="/data", tags=["data"])  # Include the data router
app.include_router(car_routes.router, prefix="/cars")  # Ensure the prefix is set correctly
app.include_router(auth.router)  # Include the auth router

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down...")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logging.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logging.info(f"Response: {response.status_code}")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
