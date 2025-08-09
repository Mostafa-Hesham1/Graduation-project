"""
Script to prepare the test environment for Locust performance tests:
1. Create a test user
2. Add some test car listings
3. Verify API endpoints are accessible
"""
import requests
import json
import logging
import sys

# Setup logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API base URL
BASE_URL = "http://localhost:8000"

# Test user credentials - updated with valid user credentials
TEST_USER = {
    "username": "mostafa112",
    "email": "mostafa112@test.com",
    "password": "Qwerty123!",
    "phone": "01012345678"  # Egyptian phone format
}

def create_or_login_test_user():
    """Create a test user for performance testing or login if user already exists"""
    try:
        # Try to login first
        login_url = f"{BASE_URL}/auth/json-login"
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        logger.info(f"Attempting to login with: {TEST_USER['email']}")
        
        # Try to log in
        login_response = requests.post(
            login_url, 
            json=login_data, 
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            logger.info("Login successful! Test user exists and credentials are valid.")
            return login_response.json().get("access_token")
        else:
            logger.warning(f"Login failed with status code: {login_response.status_code}")
            logger.warning(f"Response: {login_response.text}")
            
            # If login failed, try to create a new user
            if login_response.status_code == 401:
                logger.info("Attempting to create new test user...")
                signup_url = f"{BASE_URL}/auth/signup"
                signup_response = requests.post(
                    signup_url, 
                    json=TEST_USER,
                    headers={"Content-Type": "application/json"}
                )
                
                if signup_response.status_code == 200:
                    logger.info("Test user created successfully")
                    return signup_response.json().get("access_token")
                else:
                    logger.error(f"Failed to create test user: {signup_response.status_code}")
                    logger.error(f"{signup_response.text}")
                    
                    # If user already exists but we couldn't log in, provide troubleshooting advice
                    if "Email or phone already registered" in signup_response.text:
                        logger.error("User already exists but login failed. Possible causes:")
                        logger.error("1. Password mismatch - Update TEST_USER with correct password")
                        logger.error("2. Account locked - Check backend logs")
                        logger.error("3. Authentication system error - Verify JWT settings")
            
            return None
    
    except Exception as e:
        logger.error(f"Error creating/logging in test user: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def verify_endpoints(token=None):
    """Verify the API endpoints used in tests are accessible"""
    endpoints = [
        {"url": "/api/cars/listings", "method": "GET", "name": "Car Listings"},
        {"url": "/api/cars/marketplace", "method": "GET", "name": "Car Marketplace"},
        {"url": "/profile/profile", "method": "GET", "name": "User Profile", "auth": True},
        {"url": "/auth/json-login", "method": "POST", "name": "Login", "data": {
            "email": TEST_USER["email"], 
            "password": TEST_USER["password"]
        }}
    ]
    
    results = []
    
    for endpoint in endpoints:
        try:
            url = f"{BASE_URL}{endpoint['url']}"
            method = endpoint["method"]
            headers = {"Content-Type": "application/json"}
            
            if endpoint.get("auth") and token:
                headers["Authorization"] = f"Bearer {token}"
                logger.info(f"Adding auth token for {endpoint['name']}")
            
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=endpoint.get("data", {}), headers=headers, timeout=10)
            
            status = "✅ OK" if response.status_code < 400 else f"❌ Failed ({response.status_code})"
            
            # Add response details for debugging
            response_text = ""
            if response.status_code >= 400:
                try:
                    response_text = response.json()
                except:
                    response_text = response.text[:100] + "..." if len(response.text) > 100 else response.text
            
            results.append({
                "name": endpoint["name"],
                "url": url,
                "status_code": response.status_code,
                "status": status,
                "response": response_text
            })
            
            logger.info(f"Endpoint {endpoint['name']} - {status}")
            if response_text:
                logger.info(f"  Response: {response_text}")
            
        except Exception as e:
            logger.error(f"Error testing endpoint {endpoint['name']}: {str(e)}")
            results.append({
                "name": endpoint["name"],
                "url": f"{BASE_URL}{endpoint['url']}",
                "status": f"❌ Error: {str(e)}"
            })
    
    return results

def update_settings_file():
    """Update the settings.py file with valid credentials"""
    try:
        settings_file = "config/settings.py"
        with open(settings_file, 'r') as f:
            content = f.read()
        
        # Update test user credentials
        content = content.replace(
            'TEST_USER = {',
            f'TEST_USER = {{\n    "email": "{TEST_USER["email"]}",\n    "password": "{TEST_USER["password"]}",'
        )
        
        # Write updated content
        with open(settings_file, 'w') as f:
            f.write(content)
            
        logger.info(f"Updated settings file with valid test credentials")
    except Exception as e:
        logger.error(f"Error updating settings file: {str(e)}")

if __name__ == "__main__":
    logger.info("Preparing test environment for Locust performance tests...")
    
    # Create test user or login
    token = create_or_login_test_user()
    
    if token:
        logger.info("Test user authentication successful")
        logger.info(f"Token: {token[:10]}...")
        
        # Update settings file with valid credentials
        update_settings_file()
    else:
        logger.warning("Could not authenticate test user - some tests may fail")
    
    # Verify endpoints
    results = verify_endpoints(token)
    
    # Print summary
    logger.info("\nEndpoint Verification Results:")
    logger.info("=" * 60)
    for result in results:
        logger.info(f"{result['name']} ({result['url']}): {result['status']}")
    logger.info("=" * 60)
    
    # Provide specific troubleshooting guidance based on failures
    failures = [r for r in results if "Failed" in r.get("status", "")]
    if failures:
        logger.warning("\nTroubleshooting suggestions for failed endpoints:")
        for failure in failures:
            if "Login" in failure["name"]:
                logger.warning(f"- Login failed: Check if TEST_USER credentials match a valid user in your database")
                logger.warning(f"  Make sure the user exists with email '{TEST_USER['email']}' and correct password")
            elif "Profile" in failure["name"]:
                logger.warning(f"- Profile endpoint failed: This requires authentication")
                logger.warning(f"  Verify that the token is being properly passed in the Authorization header")
    
    logger.info("\nSetup complete! Use the following command to run tests:")
    logger.info("locust -f locustfile.py --host=http://localhost:8000 --web-host=127.0.0.1")
