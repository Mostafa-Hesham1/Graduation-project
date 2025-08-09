"""
Test Case 1: Normal Load Response Time (TC_PERF_001)
Verifies that the API responds within acceptable time under a normal load of 10 users
"""
import random
import time
from locust import HttpUser, task, tag, between
from config.settings import SAMPLE_CAR_IDS, ENDPOINTS

class NormalLoadUser(HttpUser):
    """User class for normal load testing - 10 users, checking response time"""
    
    wait_time = between(1, 3)  # 1-3 seconds wait between tasks
    
    def on_start(self):
        """Initialize user session"""
        self.car_id = random.choice(SAMPLE_CAR_IDS)
    
    @tag('TC_PERF_001')
    @task
    def get_car_details(self):
        """Test getting car details by ID - should respond within 500ms"""
        car_id = random.choice(SAMPLE_CAR_IDS)
        
        # Try multiple endpoint patterns in order of preference
        endpoints_to_try = [
            f"/api/cars/listing/{car_id}",  # Primary endpoint from backend
            f"/api/cars/{car_id}",          # Alternative endpoint
            f"/cars/{car_id}"               # Another alternative
        ]
        
        for endpoint_url in endpoints_to_try:
            with self.client.get(endpoint_url, name="Get Car Details", catch_response=True) as response:
                if response.status_code == 200:
                    # Success - break the loop
                    if response.elapsed.total_seconds() <= 0.5:  # 500ms
                        response.success()
                    else:
                        response.failure(f"Response time too slow: {response.elapsed.total_seconds()*1000:.0f}ms")
                    return
        
        # If we get here, all endpoints failed
        # Use the first endpoint for the failure report
        with self.client.get(endpoints_to_try[0], name="Get Car Details", catch_response=True) as response:
            response.failure(f"Failed to get car details: {response.status_code}")
                
    @tag('TC_PERF_001')
    @task(2)  # This task runs twice as often as get_car_details
    def list_cars(self):
        """Test listing cars - secondary test for normal load"""
        endpoint = ENDPOINTS["car_listing"]
        
        with self.client.get(endpoint, name="List Cars", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to list cars: {response.status_code}")
