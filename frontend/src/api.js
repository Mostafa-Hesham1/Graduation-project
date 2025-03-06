import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Base URL without /api

// Update the registerUser function to better handle CORS errors
export const registerUser = async (userData) => {
  try {
    console.log("Sending registration request:", userData);
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      // Don't include credentials for signup/login
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Registration error:", data);
      throw new Error(data.detail || "Registration failed");
    }
    
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Update the login function
export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const uploadCarListing = async (carData) => {
  console.log("Sending car listing with auth token"); // Debug log
  const token = localStorage.getItem('token') || 'testing'; // Use stored token or fallback
  console.log("Using token:", token); // Debug token value
  
  try {
    // Important: Don't set Content-Type header when using FormData
    // The browser will automatically set the correct multipart/form-data with boundary
    const response = await fetch(`${API_URL}/cars/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: carData,
    });
    
    console.log("Response status:", response.status); // Debug response status
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        console.error("Error details:", errorData); // Debug error details
        errorText = errorData.detail || errorData.message || 'Unknown error';
      } catch (e) {
        errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
      }
      throw new Error(`Failed to upload car listing: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getUserListings = async () => {
  console.log("Fetching user listings");
  const token = localStorage.getItem('token') || 'testing';
  
  try {
    // Make API request to get user's car listings
    const response = await fetch(`${API_URL}/cars/my-listings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Listings data received:", data);
    
    // If we got data with listings, return it
    if (data && data.listings && data.listings.length > 0) {
      return data;
    }
    
    // If no listings were found, show a message and return empty listings array
    console.log("No listings found for this user");
    return { 
      listings: [] 
    };
    
  } catch (error) {
    console.error("Error fetching listings:", error);
    
    // Return empty listings array on error
    return { 
      listings: [] 
    };
  }
};

// Add a function to check auth status
export const checkAuthStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        ...getAuthHeaders()
      },
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      // If server rejects the token, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
};

