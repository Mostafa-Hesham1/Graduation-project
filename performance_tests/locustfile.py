"""
Main Locust file that imports all test cases.
This is the entry point for Locust performance testing.

Usage:
    1. Run all tests:
       locust -f locustfile.py --host=http://localhost:8000
       
    2. Run specific test case:
       locust -f locustfile.py --host=http://localhost:8000 --tags TC_PERF_001
       
    3. Run headless with specific parameters:
       locust -f locustfile.py --host=http://localhost:8000 --headless -u 10 -r 1 -t 5m
"""
from test_cases.normal_load import NormalLoadUser
from test_cases.high_load import HighLoadUser
from test_cases.spike_load import SpikeLoadUser
from test_cases.soak_test import SoakTestUser
from test_cases.throughput_test import ThroughputUser

# All the User classes are automatically detected by Locust
# You can select which test to run using the web UI or command-line options

__all__ = [
    "NormalLoadUser",
    "HighLoadUser", 
    "SpikeLoadUser",
    "SoakTestUser",
    "ThroughputUser"
]

# Print information about available test cases
print("VehicleSouq Performance Test Suite")
print("=" * 50)
print("Available test cases:")
print("- TC_PERF_001: Normal Load (10 users) - NormalLoadUser")
print("- TC_PERF_002: High Load (1000 users) - HighLoadUser")
print("- TC_PERF_003: Spike Test (10→500 users) - SpikeLoadUser")
print("- TC_PERF_004: Soak Test (50 users, 1 hour) - SoakTestUser")
print("- TC_PERF_005: Throughput Test (100 users) - ThroughputUser")
print("=" * 50)
