import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")

# Create a MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)

# Get the database
db = client.vehicle_souq  # Use your actual database name

# Print connection status for debugging
print(f"Connected to MongoDB: {MONGODB_URI.split('@')[1] if MONGODB_URI else 'Not connected'}")

# Attempt to connect to the database
try:
    # Check if the connection is successful by listing the collections
    collections = db.list_collection_names()
    logging.info("Connected to MongoDB successfully. Collections: %s", collections)
except Exception as e:
    logging.error("Failed to connect to MongoDB: %s", e)