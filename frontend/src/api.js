import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Snackbar, Alert } from '@mui/material';
import React from 'react';

const API_URL = 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create a custom toast/snackbar function using Material-UI
const showToast = (message, severity = 'warning') => {
  // Create a container for the snackbar if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create a root and render the snackbar
  const root = createRoot(container);
  
  // Create snackbar component
  const ToastContent = () => {
    const [open, setOpen] = React.useState(true);
    
    const handleClose = () => {
      setOpen(false);
      // Remove the container after animation completes
      setTimeout(() => {
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }, 1000);
    };
    
    return (
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    );
  };
  
  root.render(<ToastContent />);
};

// Track the last authentication timestamp to prevent false session expiry messages
let lastAuthTimestamp = 0;

// Reset the authentication timestamp when token is updated
export const updateAuthTimestamp = () => {
  lastAuthTimestamp = Date.now();
};

// Handle session expiration globally with improved logic
axios.interceptors.response.use(
  response => response,
  error => {
    // Only process 401 errors if they're not from login/auth endpoints
    if (error.response?.status === 401 && 
        !error.config.url.includes('/json-login') && 
        !error.config.url.includes('/login') &&
        !error.config.url.includes('/signup')) {
      
      // Check if authentication just happened recently (within 5 seconds)
      // This prevents the session expired message from showing right after login
      const timeSinceAuth = Date.now() - lastAuthTimestamp;
      if (timeSinceAuth > 5000) {
        console.log("Session expired - clearing auth data");
        
        // Clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show toast notification
        showToast('Your session has expired. Please log in again.', 'warning');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        console.log("Ignoring 401 error right after auth");
      }
    }
    return Promise.reject(error);
  }
);

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
    const response = await axios.post('/api/signup', userData);
    console.log('Registration response:', response);
    
    // Better validation of response
    if (!response.data || !response.data.access_token) {
      console.error('Invalid registration response format:', response.data);
      throw new Error('Server returned an invalid response format');
    }
    
    // Save the token and user information
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.user_id,
      username: response.data.username,
      email: response.data.email,
      role: response.data.role || 'user'
    }));
    
    // Update auth timestamp on successful registration
    updateAuthTimestamp();
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// User login with improved error handling and response validation
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting login with:', credentials.email);
    
    // Try to login with the primary login endpoint
    try {
      console.log('Sending request to /api/json-login with:', {
        email: credentials.email,
        password: '(password hidden)'
      });
      
      const response = await axios.post('/api/json-login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      console.log('Response data:', response.data);
      
      // Validate the response data structure with fallbacks
      if (!response.data) {
        console.error('Empty response data');
        throw new Error('Server returned empty response');
      }
      
      // Check if access_token exists
      if (!response.data.access_token) {
        console.error('Missing access_token in response:', response.data);
        // Try to extract the token from response.data if it's a string
        if (typeof response.data === 'string') {
          try {
            // Try to parse the response data if it's a JSON string
            const parsedData = JSON.parse(response.data);
            if (parsedData.access_token) {
              console.log('Successfully parsed JSON string response');
              response.data = parsedData;
            } else {
              throw new Error('Missing access token in parsed response');
            }
          } catch (parseError) {
            console.error('Error parsing response data:', parseError);
            throw new Error('Server returned an invalid response format');
          }
        } else {
          throw new Error('Server returned a response without access token');
        }
      }
      
      // Extract necessary values with fallbacks
      const userData = {
        token: response.data.access_token,
        userId: response.data.user_id || 'unknown',
        username: response.data.username || 'user',
        email: response.data.email || credentials.email,
        role: response.data.role || 'user'
      };
      
      console.log('Extracted user data:', userData);
      
      // Save the token and user information to localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify({
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        role: userData.role
      }));
      
      updateAuthTimestamp();
      return response.data;
    } catch (primaryError) {
      console.error('Primary login endpoint failed:', primaryError);
      
      // Try the debug login endpoint to get more information
      try {
        console.log('Trying debug login endpoint for diagnostic information');
        const debugResponse = await axios.post('/api/debug-login', {
          email: credentials.email,
          password: credentials.password
        });
        
        console.log('Debug login response:', debugResponse.data);
        
        // If debug login authenticates successfully, use that data
        if (debugResponse.data.authenticated && debugResponse.data.auth_details) {
          console.log('Debug login authenticated successfully');
          
          const userData = {
            token: debugResponse.data.auth_details.access_token,
            userId: debugResponse.data.auth_details.user_id,
            username: debugResponse.data.user?.username || 'user',
            email: debugResponse.data.user?.email || credentials.email,
            role: debugResponse.data.user?.role || 'user'
          };
          
          // Save the token and user information
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify({
            id: userData.userId,
            username: userData.username,
            email: userData.email,
            role: userData.role
          }));
          
          updateAuthTimestamp();
          return {
            access_token: userData.token,
            token_type: "bearer",
            user_id: userData.userId,
            username: userData.username,
            email: userData.email,
            role: userData.role
          };
        }
      } catch (debugError) {
        console.error('Debug login also failed:', debugError);
      }
      
      // If primary endpoint is not 405, try the secondary endpoint
      if (primaryError.response?.status === 405) {
        console.log('Method not allowed, trying secondary endpoint');
        const response = await axios.post('/api/login', {
          username: credentials.email,  // OAuth2 spec uses 'username'
          password: credentials.password
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: [(data) => {
            return Object.entries(data)
              .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
              .join('&');
          }]
        });
        
        console.log('Login successful with secondary endpoint:', response);
        
        // Validate the response data structure
        if (!response.data || !response.data.access_token) {
          console.error('Invalid login response format from secondary endpoint:', response.data);
          throw new Error('Server returned an invalid response format');
        }
        
        // Save the token and user information
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role || 'user'
        }));
        
        updateAuthTimestamp();
        return response.data;
      } else {
        // If it's not a 405 error, rethrow the original error
        throw primaryError;
      }
    }
  } catch (error) {
    console.error('All login attempts failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Try to get a helpful error message
    let errorMessage = 'Login failed. Please check your credentials and try again.';
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Upload car listing
export const uploadCarListing = async (formData) => {
  try {
    // Log the FormData contents before sending (for debugging)
    console.log("Uploading car listing with form data:");
    for (let [key, value] of formData.entries()) {
      if (key !== 'images') {  // Don't log binary image data
        console.log(`${key}: ${value}`);
      } else {
        console.log(`${key}: [Binary data]`);
      }
    }
    
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/cars/list', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error in uploadCarListing:', error);
    throw error.response?.data || { message: 'Network error' };
  }
};

// Enhanced checkAuthStatus function with retry logic
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Try to validate token with primary endpoint
    try {
      // Updated endpoint to use /api/auth-check
      const response = await axios.get('/api/auth-check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { 
        isAuthenticated: true,
        user: response.data.user 
      };
    } catch (primaryError) {
      // If primary endpoint fails, try secondary endpoint
      console.log('Primary token validation failed, trying secondary endpoint');
      
      // Falling back to root auth check endpoint
      const response = await axios.get('/auth-check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { 
        isAuthenticated: true,
        user: response.data.user 
      };
    }
  } catch (error) {
    console.error('All auth check methods failed:', error.response?.status || error.message);
    
    // If token is invalid, clear local storage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return { isAuthenticated: false };
  }
};

// Better handling of requests with authentication
const makeAuthenticatedRequest = async (method, url, data = null, customHeaders = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers = {
      Authorization: `Bearer ${token}`,
      ...customHeaders
    };
    
    const config = { headers };
    
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, config);
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, data, config);
    } else if (method.toLowerCase() === 'put') {
      response = await axios.put(url, data, config);
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, config);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error.response || error.message);
    
    // Special handling for 401 errors
    if (error.response?.status === 401) {
      // This will be handled by the axios interceptor
      throw error;
    }
    
    throw error;
  }
};

// Update fetchUserListings to use the new helper
export const fetchUserListings = async () => {
  try {
    const data = await makeAuthenticatedRequest('get', '/api/cars/my-listings');
    return data;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return { listings: [] };
  }
};

// Get all car listings with optional filters
export const fetchCarListings = async (filters = {}, page = 1, limit = 24) => {
  try {
    // Process 'undefined' values to null or empty strings
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      // Skip undefined, null, or empty values
      if (value !== undefined && value !== null && value !== '') {
        // Convert values like 'undefined' string to empty string
        acc[key] = value === 'undefined' ? '' : value;
      }
      return acc;
    }, {});
    
    // Add page and limit to params
    const params = new URLSearchParams({
      page,
      limit,
      ...cleanFilters
    });
    
    console.log('Fetching listings with params:', params.toString());
    
    const response = await axios.get(`/api/cars/listings?${params}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching car listings:', error.response || error.message);
    return { listings: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

// Get listing details by ID
export const getListingById = async (id) => {
  try {
    const response = await axios.get(`/api/cars/listing/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
};

// Update getUnreadMessageCount to use the new helper
export const getUnreadMessageCount = async () => {
  try {
    const data = await makeAuthenticatedRequest('get', '/api/messages/unread/count');
    return data.unread_count;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return 0; // Return 0 on error to prevent UI issues
  }
};

// Message APIs
// Update getConversations to use the new helper
export const getConversations = async () => {
  try {
    return await makeAuthenticatedRequest('get', '/api/messages/conversations');
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getMessages = async (userId, limit = 50, before = null) => {
  try {
    let url = `/api/messages/${userId}?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (recipientId, content, listingId = null) => {
  try {
    const payload = {
      recipient_id: recipientId,
      content,
      listing_id: listingId
    };
    const response = await axios.post('/api/messages/send', payload, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (userId) => {
  try {
    const response = await axios.post(`/api/messages/${userId}/mark-read`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Debug helper function to inspect server responses in the console
export const debugServerResponse = async (endpoint) => {
  try {
    const response = await axios.get(endpoint);
    console.log(`Response from ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error from ${endpoint}:`, error.response || error.message);
    return { error: error.message };
  }
};

