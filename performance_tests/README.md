# VehicleSouq Performance Testing

This directory contains performance tests for the VehicleSouq application using Locust.

## Test Cases

| Test Case ID | Description | Endpoint | Users | Expected Result |
|--------------|-------------|----------|-------|-----------------|
| TC_PERF_001  | Normal Load Response Time | /api/cars/{car_id} | 10 | Avg response time ≤ 500ms |
| TC_PERF_002  | High Concurrent Load | /api/cars/listings | 1000 | 95% responses < 1s, <2% error rate |
| TC_PERF_003  | Spike Load Test | /auth/json-login | 10→500 in <1min | No 500 errors |
| TC_PERF_004  | Soak Test (1 hour) | Multiple | 50 | Stable memory/CPU |
| TC_PERF_005  | Throughput Rate | /api/cars/listings | 100 | ≥100 requests/sec |

## Running the Tests

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run a specific test case:
   ```
   locust -f locustfile.py --host=http://localhost:8000 --tags TC_PERF_001
   ```

3. Run all tests:
   ```
   locust -f locustfile.py --host=http://localhost:8000
   ```

4. Run headless (non-UI) with specific settings:
   ```
   locust -f locustfile.py --host=http://localhost:8000 --headless -u 10 -r 1 -t 5m --tags TC_PERF_001
   ```

Options:
- `-u`: Number of users
- `-r`: Spawn rate (users spawned per second)
- `-t`: Test duration (e.g., 5m for 5 minutes)
