import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Base URL without /api

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Get error details if available
    throw new Error(`Failed to register user: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json(); // Return the response data
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Get error details if available
    console.error('Login error response:', errorData); // Log the error response
    throw new Error(`Failed to log in: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json(); // Return the response data
};

export const uploadCarListing = async (carData) => {
  const response = await fetch(`${API_URL}/cars/list`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: carData, // Use FormData directly
  });

  if (!response.ok) {
    const errorData = await response.json(); // Get error details if available
    throw new Error(`Failed to upload car listing: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json(); // Return the response data
};

