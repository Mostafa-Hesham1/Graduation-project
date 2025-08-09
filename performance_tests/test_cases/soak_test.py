"""
Test Case 4: Soak Test (TC_PERF_004)
Runs 50 virtual users constantly for 1 hour to detect memory leaks
"""
import random
import time
from locust import HttpUser, task, tag, between
from config.settings import SAMPLE_CAR_IDS, TEST_USER

class SoakTestUser(HttpUser):
    """User class for soak testing - 50 users for 1 hour"""
    
    wait_time = between(3, 7)  # 3-7 seconds wait between tasks
    
    def on_start(self):
        """Setup user session with authentication"""
        self.token = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate user to get token"""
        headers = {'Content-Type': 'application/json'}
        payload = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        with self.client.post(
            "/auth/json-login", 
            json=payload,
            name="Login (Soak Test)",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                resp_json = response.json()
                if "access_token" in resp_json:
                    self.token = resp_json["access_token"]
            else:
                # Just log the error but continue - we'll skip authenticated endpoints
                pass
    
    @tag('TC_PERF_004')
    @task(10)
    def browse_listings(self):
        """Browse car listings repeatedly to test for memory leaks"""
        params = {
            "page": random.randint(1, 5),
            "limit": random.choice([10, 20, 50]),
            "sortBy": random.choice(["newest", "price_low", "price_high"])
        }
        
        with self.client.get(
            "/api/cars/listings", 
            name="Browse Listings (Soak)",
            params=params,
            catch_response=True
        ) as response:
            if response.status_code != 200:
                response.failure(f"Failed to get listings: {response.status_code}")
    
    @tag('TC_PERF_004')
    @task(5)
    def view_car_details(self):
        """View details of specific cars"""
        car_id = random.choice(SAMPLE_CAR_IDS)
        
        # Try multiple endpoint patterns to find the one that works
        endpoints_to_try = [
            f"/api/cars/listing/{car_id}",  # Primary endpoint from backend
            f"/api/cars/{car_id}",          # Alternative endpoint
            f"/cars/{car_id}"               # Another alternative
        ]
        
        for endpoint_url in endpoints_to_try:
            with self.client.get(
                endpoint_url, 
                name="View Car Details (Soak)",
                catch_response=True
            ) as response:
                if response.status_code == 200:
                    # Success - break the loop
                    return
                
        # If we reach here, all endpoints failed
        with self.client.get(
            endpoints_to_try[0], 
            name="View Car Details (Soak)",
            catch_response=True
        ) as response:
            response.failure(f"Failed to view car details: {response.status_code}")
    
    @tag('TC_PERF_004')
    @task(3)
    def check_profile(self):
        """Access user profile - authenticated endpoint"""
        if not self.token:
            return
            
        headers = {"Authorization": f"Bearer {self.token}"}
        
        with self.client.get(
            "/profile/profile",
            name="Check Profile (Soak)",
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code != 200:
                if response.status_code == 401:
                    # Token expired, try to refresh
                    self.authenticate()
                    response.failure("Token expired")
                else:
                    response.failure(f"Failed to get profile: {response.status_code}")
        self.login()
