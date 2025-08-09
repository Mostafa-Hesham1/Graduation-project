"""
Configuration settings for performance tests
"""

# Common test settings
BASE_URL = "http://localhost:8000"  # Default base URL for tests

# Sample car IDs for testing (these should exist in your database)
# Update with real car IDs from your database
SAMPLE_CAR_IDS = ["67ed1ea1dbbe1ecc0daef616", "67ed0d01dbbe1ecc0daef612", "67ebea242845f1d2d0c1a399", "67eaee61018b9e91a8ed1b60", "67eaed59dd3102c59c65e840"]

# Sample user credentials for authentication tests
# Updated with valid user credentials
TEST_USER = {
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!"
}

# Test-specific settings
NORMAL_LOAD_SETTINGS = {
    "users": 10,
    "spawn_rate": 1,
    "run_time": "5m"
}

HIGH_LOAD_SETTINGS = {
    "users": 1000,
    "spawn_rate": 100,
    "run_time": "10m"
}

SPIKE_TEST_SETTINGS = {
    "initial_users": 10,
    "peak_users": 500,
    "spawn_rate": 50,
    "run_time": "10m"
}

SOAK_TEST_SETTINGS = {
    "users": 50,
    "spawn_rate": 10,
    "run_time": "60m"  # 1 hour
}

THROUGHPUT_TEST_SETTINGS = {
    "users": 100,
    "spawn_rate": 10,
    "run_time": "5m"
}

# API endpoints - Updated to match actual backend endpoints
ENDPOINTS = {
    "car_listing": "/api/cars/listings",
    "car_detail": "/api/cars/listing/{car_id}",  # Updated endpoint path
    "login": "/auth/json-login",
    "signup": "/auth/signup",
    "profile": "/profile/profile",
    "marketplace": "/api/cars/marketplace",
    "damage_detect": "/damage/detect"
}
