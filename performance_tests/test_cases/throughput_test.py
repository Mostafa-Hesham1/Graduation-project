"""
Test Case 5: Throughput Rate (TC_PERF_005)
Measures the number of successful requests per second under 100 concurrent users
"""
import random
from locust import HttpUser, task, tag, between
from config.settings import SAMPLE_CAR_IDS

class ThroughputUser(HttpUser):
    """User class for throughput testing - 100 users"""
    
    # Minimal wait time to maximize throughput
    wait_time = between(0.1, 1.0)  # 100ms to 1s between tasks
    
    @tag('TC_PERF_005')  # Tag must come before task decorator
    @task
    def list_cars_fast(self):
        """Repeatedly hit the listings endpoint to measure throughput"""
        # Randomize parameters to avoid caching effects
        params = {
            "page": random.randint(1, 3),
            "limit": 10,  # Small result set for faster response
            "sortBy": "newest"
        }
        
        with self.client.get(
            "/api/cars/listings", 
            params=params,
            name="Car Listings (Throughput)",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                # Successfully processed request counts toward throughput
                pass
            else:
                response.failure(f"Request failed: {response.status_code}")
