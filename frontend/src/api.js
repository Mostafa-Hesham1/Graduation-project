import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User registration
export const registerUser = async (userData) => {
  try {
    const response = await axios.post('/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// User login - simplified direct approach
export const loginUser = async (credentials) => {
  try {
    // Create a plain object for direct JSON login
    const loginData = {
      email: credentials.email,
      password: credentials.password
    };
    
    console.log('Attempting simplified JSON login');
    
    // Try the JSON login endpoint directly
    const response = await axios.post('/json-login', loginData);
    console.log('Login successful with JSON endpoint');
    return response.data;
  } catch (error) {
    // If JSON login fails, try form-based login as fallback
    try {
      if (error.response?.status === 404 || error.response?.status === 422) {
        console.log('JSON login failed, trying form login as fallback');
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);
        
        const formResponse = await axios.post('/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        console.log('Form login successful');
        return formResponse.data;
      }
    } catch (formError) {
      console.error('Form login also failed:', formError);
      throw formError;
    }
    
    // If we get here, neither method worked
    console.error('Login error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: JSON.stringify(error.response?.data || {})
    });
    
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else {
      throw new Error('Login failed. Please try again with correct credentials.');
    }
  }
};

// Get user's listings

// Upload car listing
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


// Add other API functions as needed

