"""
Test Case 3: Spike Load (TC_PERF_003)
Tests system behavior with sudden spike from 10 to 500 users
"""
import random
import json
from locust import HttpUser, task, tag, between
from config.settings import TEST_USER

class SpikeLoadUser(HttpUser):
    """User class for spike testing - sudden spike from 10 to 500 users"""
    
    wait_time = between(1, 3)  # 1-3 seconds wait between tasks
    
    def on_start(self):
        """Setup user session with authentication"""
        self.token = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate user for the test"""
        headers = {'Content-Type': 'application/json'}
        payload = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        with self.client.post(
            "/auth/json-login", 
            json=payload,
            name="Login (Spike Test)",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                resp_json = response.json()
                if "access_token" in resp_json:
                    self.token = resp_json["access_token"]
            else:
                # Log the error but continue - we'll skip authenticated endpoints
                pass
    
    @tag('TC_PERF_003')  # Tag must come before task decorator
    @task(3)
    def list_cars(self):
        """Test listing cars API during spike load"""
        params = {
            "page": random.randint(1, 5),
            "limit": random.choice([10, 20, 50]),
            "sortBy": random.choice(["newest", "price_low", "price_high"])
        }
        
        with self.client.get(
            "/api/cars/listings", 
            name="List Cars",
            params=params,
            catch_response=True
        ) as response:
            if response.status_code != 200:
                if response.status_code == 401:
                    # Token expired, try to login again
                    self.authenticate()
                    response.failure("Token expired")
                else:
                    response.failure(f"Failed to list cars: {response.status_code}")
    
    @tag('TC_PERF_003')
    @task(1)
    def login_during_spike(self):
        """Attempt to login during spike - stresses auth system"""
        self.authenticate()
        """Attempt to login during spike - stresses auth system"""
        self.login()
