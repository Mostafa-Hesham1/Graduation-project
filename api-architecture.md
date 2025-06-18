# VehicleSouq API Architecture

This document outlines the complete API architecture for the VehicleSouq platform, organized by functional area.

## Base URL
All endpoints are relative to: `http://localhost:8000`

## Authentication Endpoints

### User Registration
- **POST** `/auth/register`
  - Description: Register a new user
  - Request Body:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string",
      "phone": "string"
    }
    ```
  - Response: User object with token

### User Login
- **POST** `/auth/login`
  - Description: Authenticate a user
  - Request Body:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response: User object with token

### Logout
- **POST** `/auth/logout`
  - Description: Invalidate user token
  - Headers: Authorization Bearer token
  - Response: Success message

### Password Reset
- **POST** `/auth/forgot-password`
  - Description: Send password reset link
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```
  - Response: Success message

- **PUT** `/auth/reset-password`
  - Description: Reset password with token
  - Request Body:
    ```json
    {
      "token": "string",
      "password": "string"
    }
    ```
  - Response: Success message

### Token Validation
- **GET** `/auth/validate-token`
  - Description: Check if token is valid
  - Headers: Authorization Bearer token
  - Response: User data if token is valid

## User Management Endpoints

### User Profile
- **GET** `/users/profile`
  - Description: Get current user profile
  - Headers: Authorization Bearer token
  - Response: User profile data

- **PUT** `/users/profile`
  - Description: Update user profile
  - Headers: Authorization Bearer token
  - Request Body: User profile data
  - Response: Updated user profile

### User Listings
- **GET** `/users/listings`
  - Description: Get current user's listings
  - Headers: Authorization Bearer token
  - Response: Array of listings

### User Favorites
- **GET** `/users/favorites`
  - Description: Get current user's favorite listings
  - Headers: Authorization Bearer token
  - Response: Array of favorite listings

- **POST** `/users/favorites/:listingId`
  - Description: Add a listing to favorites
  - Headers: Authorization Bearer token
  - Response: Updated favorites list

- **DELETE** `/users/favorites/:listingId`
  - Description: Remove a listing from favorites
  - Headers: Authorization Bearer token
  - Response: Updated favorites list

## Car Listings Endpoints

### Browse Listings
- **GET** `/cars/listings`
  - Description: Get all car listings with optional filters
  - Query Parameters:
    - `limit`: Maximum number of results (default: 20)
    - `page`: Page number for pagination
    - `sort`: Sort order (e.g., 'price_asc', 'price_desc', 'date_desc')
    - `make`: Filter by car make
    - `model`: Filter by car model
    - `year_min`: Filter by minimum year
    - `year_max`: Filter by maximum year
    - `price_min`: Filter by minimum price
    - `price_max`: Filter by maximum price
    - `condition`: Filter by condition (e.g., 'new', 'used')
    - `fuel_type`: Filter by fuel type
    - `transmission`: Filter by transmission type
    - `body_type`: Filter by body type
    - `search`: Search term for title/description
  - Response: Array of listings with pagination metadata

### Listing Details
- **GET** `/cars/listings/:listingId`
  - Description: Get detailed information about a specific listing
  - Response: Complete listing object

### Create Listing
- **POST** `/cars/listings`
  - Description: Create a new car listing
  - Headers: Authorization Bearer token
  - Request Body: Listing data
  - Response: Created listing

### Update Listing
- **PUT** `/cars/listings/:listingId`
  - Description: Update an existing listing
  - Headers: Authorization Bearer token
  - Request Body: Updated listing data
  - Response: Updated listing

### Delete Listing
- **DELETE** `/cars/listings/:listingId`
  - Description: Delete a listing
  - Headers: Authorization Bearer token
  - Response: Success message

### Image Upload
- **POST** `/upload/images`
  - Description: Upload images for a listing
  - Headers: Authorization Bearer token
  - Request Body: Form data with images
  - Response: Array of image URLs/paths

### Listing Search
- **GET** `/cars/search`
  - Description: Search for listings
  - Query Parameters:
    - `q`: Search term
    - Other filter parameters (same as /cars/listings)
  - Response: Array of matching listings

## Admin Endpoints

### Dashboard Statistics
- **GET** `/admin/stats-direct`
  - Description: Get dashboard statistics
  - Headers: Authorization Bearer token (admin)
  - Response: Statistics object

### User Management
- **GET** `/admin/users-direct`
  - Description: Get all users
  - Headers: Authorization Bearer token (admin)
  - Response: Array of user objects

- **GET** `/admin/users/:userId`
  - Description: Get specific user details
  - Headers: Authorization Bearer token (admin)
  - Response: User object

- **PUT** `/admin/users/:userId`
  - Description: Update user
  - Headers: Authorization Bearer token (admin)
  - Request Body: Updated user data
  - Response: Updated user object

- **DELETE** `/admin/users/:userId`
  - Description: Delete user
  - Headers: Authorization Bearer token (admin)
  - Response: Success message

### Listing Management
- **GET** `/admin/listings-direct`
  - Description: Get all listings (admin view)
  - Headers: Authorization Bearer token (admin)
  - Response: Array of listing objects

- **PUT** `/admin/listings/:listingId`
  - Description: Update listing (admin)
  - Headers: Authorization Bearer token (admin)
  - Request Body: Updated listing data
  - Response: Updated listing

- **DELETE** `/admin/listings/:listingId`
  - Description: Delete listing (admin)
  - Headers: Authorization Bearer token (admin)
  - Response: Success message

### Growth Metrics
- **GET** `/admin/growth-metrics-direct`
  - Description: Get growth metrics for dashboard
  - Headers: Authorization Bearer token (admin)
  - Response: Growth metrics object

## Data Visualization Endpoints

### Make Statistics
- **GET** `/data/make`
  - Description: Get car make distribution statistics
  - Response: Array of make counts

### Model Statistics
- **GET** `/data/model`
  - Description: Get car model distribution statistics
  - Response: Array of model counts

### Fuel Type Statistics
- **GET** `/data/fuel`
  - Description: Get fuel type distribution statistics
  - Response: Array of fuel type counts

### Yearly Trends
- **GET** `/data/yearly`
  - Description: Get distribution of cars by year
  - Response: Array of year counts

## Web Scraping Endpoints

### Scrape Car Listings
- **POST** `/scrape/cars`
  - Description: Trigger scraping of car listings from external sources
  - Headers: Authorization Bearer token (admin)
  - Request Body:
    ```json
    {
      "source": "string",
      "limit": "number",
      "saveToDb": "boolean"
    }
    ```
  - Response: Scraped data or status

### Scrape Car Makes/Models
- **POST** `/scrape/makes-models`
  - Description: Scrape car makes and models data
  - Headers: Authorization Bearer token (admin)
  - Response: Scraped data or status

## Utility Endpoints

### Car Makes and Models
- **GET** `/utils/makes`
  - Description: Get list of car makes
  - Response: Array of car makes

- **GET** `/utils/models/:make`
  - Description: Get list of models for a specific make
  - Response: Array of car models

### System Status
- **GET** `/status`
  - Description: Check system status
  - Response: Status information object

## Error Responses

All endpoints should return appropriate HTTP status codes:

- 200 OK: Request succeeded
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Not enough permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server error

Error response format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "any (optional)"
  }
}
```
