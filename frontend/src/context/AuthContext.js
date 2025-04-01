import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, updateAuthTimestamp, checkAuthStatus } from '../api';
import { debugLogin, testLoginEndpoint } from '../debugUtils';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper function to update the isAdmin state based on the user's role
  const updateAdminStatus = (userData) => {
    const isUserAdmin = userData?.role === 'admin';
    setIsAdmin(isUserAdmin);
    console.log('Admin status updated:', isUserAdmin);
    return isUserAdmin;
  };

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing token in localStorage
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          try {
            // Parse the user info first to validate it's proper JSON
            const parsedUser = JSON.parse(savedUser);
            
            // Validate token with server
            const status = await checkAuthStatus();
            
            if (status.isAuthenticated) {
              setUser(parsedUser);
              setIsAuthenticated(true);
              updateAdminStatus(parsedUser);
              updateAuthTimestamp(); // Update timestamp to prevent false expirations
            } else {
              // Clear invalid data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setIsAdmin(false);
            }
          } catch (parseError) {
            console.error('Error parsing saved user data:', parseError);
            localStorage.removeItem('user');
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []);

  // Login function with enhanced error handling and fixed response structure handling
  const login = async (credentials) => {
    try {
      // Clear any existing tokens first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAdmin(false);
      
      // Update auth timestamp before login attempt
      updateAuthTimestamp();
      
      // Log the credentials being used (without password)
      console.log('Login attempt with:', { email: credentials.email });
      
      // Call the API to login
      const data = await loginUser(credentials);
      
      console.log('Login response received:', data);
      
      // Check for the access_token in the response (the correct field name)
      if (data && data.access_token) {
        // Create user object from response data
        const userObj = {
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role || 'user'
        };
        
        console.log('Extracted user data:', userObj);
        
        // Store auth data in localStorage - use access_token as the token
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setUser(userObj);
        setIsAuthenticated(true);
        
        // Update admin status
        const isUserAdmin = updateAdminStatus(userObj);
        console.log('User admin status after login:', isUserAdmin);
        
        updateAuthTimestamp();
        
        return { success: true, user: userObj, isAdmin: isUserAdmin };
      } else {
        console.error('Login response missing access_token:', data);
        
        // Try debug login as a fallback
        console.log('Attempting debug login...');
        const debugResult = await debugLogin(credentials.email, credentials.password);
        
        if (debugResult.success) {
          console.log('Debug login successful:', debugResult.userData);
          setUser(debugResult.userData);
          setIsAuthenticated(true);
          
          // Update admin status
          const isUserAdmin = updateAdminStatus(debugResult.userData);
          
          updateAuthTimestamp();
          return { success: true, user: debugResult.userData, isAdmin: isUserAdmin };
        }
        
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error in context:', error);
      
      // Try test login endpoints as a last resort
      try {
        console.log('Testing all login endpoints...');
        const testResults = await testLoginEndpoint(credentials.email, credentials.password);
        
        if (testResults.success) {
          console.log('Found working login endpoint:', testResults.workingEndpoint);
          setUser(testResults.userData);
          setIsAuthenticated(true);
          
          // Update admin status
          const isUserAdmin = updateAdminStatus(testResults.userData);
          
          updateAuthTimestamp();
          return { success: true, user: testResults.userData, isAdmin: isUserAdmin };
        } else {
          console.error('All login endpoints failed:', testResults);
        }
      } catch (testError) {
        console.error('Error testing login endpoints:', testError);
      }
      
      return { success: false, error: error.message };
    }
  };

  // Logout function with cleanup
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    authChecked,
    isAdmin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};