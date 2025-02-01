import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

# Create a MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)

# Specify the database name (replace 'your_database_name' with the actual name)
DATABASE_NAME = 'VEHICLESOUQ'  # Change this to your actual database name
db = client[DATABASE_NAME]

# Attempt to connect to the database
try:
    # Check if the connection is successful by listing the collections
    collections = db.list_collection_names()
    logging.info("Connected to MongoDB successfully. Collections: %s", collections)
except Exception as e:
    logging.error("Failed to connect to MongoDB: %s", e) 