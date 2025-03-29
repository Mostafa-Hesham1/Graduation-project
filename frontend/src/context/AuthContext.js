import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Check if user has admin role - handle different role formats
          const role = parsedUser.role || '';
          const isUserAdmin = role.toLowerCase() === 'admin';
          setIsAdmin(isUserAdmin);
          
          console.log('Auth restored from localStorage:', { 
            user: parsedUser.username, 
            role: parsedUser.role,
            isAdmin: isUserAdmin
          });
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Ensure role is handled consistently
    const role = userData.role || '';
    const isUserAdmin = role.toLowerCase() === 'admin';
    setIsAdmin(isUserAdmin);
    
    console.log('User logged in:', { 
      user: userData.username, 
      role: userData.role,
      isAdmin: isUserAdmin
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin,
      user, 
      setUser, 
      setIsAuthenticated,
      setIsAdmin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};