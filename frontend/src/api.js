import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }
  return { Authorization: `Bearer ${token}` };
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

// Upload car listing
export const uploadCarListing = async (carData) => {
  console.log("Sending car listing with auth token");
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Using axios for consistent error handling
    const response = await axios.post('/cars/list', carData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      console.error("Error details:", error.response?.data || {});
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Failed to upload car listing');
  }
};

// Get user's listings
export const getUserListings = async () => {
  console.log("Fetching user listings");
  try {
    // Using axios instead of fetch for consistency and better error handling
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    const response = await axios.get('/cars/my-listings', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    console.log("Listings data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      console.error("Error details:", error.response?.data || {});
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch user listings');
  }
};

// Get all car listings with optional filters
export const getAllListings = async (filters = {}) => {
  try {
    // Convert filters to query parameters
    const queryParams = new URLSearchParams();
    
    // Add any filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle array values
        if (Array.isArray(value)) {
          value.forEach(item => {
            queryParams.append(key, item);
          });
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const response = await axios.get(`/cars/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log("All listings data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch listings');
  }
};

// Get listing details by ID
export const getListingById = async (listingId) => {
  try {
    const response = await axios.get(`/cars/listing/${listingId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching listing details:", error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch listing details');
  }
};

