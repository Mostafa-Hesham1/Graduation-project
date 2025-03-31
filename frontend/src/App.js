import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Direct imports instead of lazy loading
import ResponsiveAppBar from './components/NavBar';
import Home from './components/Home';
import ImageUpload from './components/ImageUpload';
import DamageDetect from './components/DamageDetect';
import PricePrediction from './components/PricePrediction';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CarListing from './components/CarListing';
import UserListings from './components/UserListings';
import AdminDashboard from './components/AdminDashboard'; 
import Footer from './components/Footer';
import Scrape from './components/Scrape';
import DataVisualization from './components/DataVisualization';
import ListingDetail from './components/ListingDetail';
import MarketplaceCarDetail from './components/MarketplaceCarDetail';
import CarMarketplace from './components/CarMarketplace';

// Debug component for testing routes
const MyListingsDebug = () => {
  return (
    <div style={{padding: 20}}>
      <h1>My Listings Debug View</h1>
      <p>This is a simple component to verify the route is working.</p>
    </div>
  );
};

// Protected route component for admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add immediate logging to debug admin access
    console.log("AdminRoute - Auth state:", { isAuthenticated, isAdmin, loading });
    
    // If not loading and either not authenticated or not admin, redirect immediately
    if (!loading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate('/login');
      } else if (!isAdmin) {
        console.log("Not admin, redirecting to home");
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);
  
  // Show loading state while checking authentication
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }
  
  // Only render children if both authenticated AND admin
  // This is a double-check in case the redirect hasn't happened yet
  if (!isAuthenticated || !isAdmin) {
    console.log("Blocking admin content render - not authorized");
    return null;
  }
  
  console.log("Admin access granted, rendering admin content");
  return children;
};

function App() {
  // Add location logging
  useEffect(() => {
    // Log current path when the app loads
    console.log("Current path:", window.location.pathname);
    
    // Add a listener to log route changes
    const logRouteChange = () => {
      console.log("Route changed to:", window.location.pathname);
    };
    
    window.addEventListener('popstate', logRouteChange);
    return () => window.removeEventListener('popstate', logRouteChange);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ResponsiveAppBar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0, minHeight: '80vh' }}>
          <Routes>
            {/* Use specialized components for different contexts */}
            <Route path="/listing/:id" element={<MarketplaceCarDetail />} /> {/* Marketplace car details with messaging */}
            <Route path="/my-listing/:id" element={<ListingDetail />} /> {/* Your own listings view */}
            
            {/* Add a test route that's easy to verify */}
            <Route path="/test-detail" element={<div style={{padding: 20}}><h1>Test Detail Page</h1></div>} />
            
            <Route path="/" element={<Home />} />
            <Route path="/car-recognizer" element={<ImageUpload />} />
            <Route path="/image-upload" element={<ImageUpload />} />
            <Route path="/damage-detect" element={<DamageDetect />} />
            <Route path="/scrape" element={<Scrape />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            <Route path="/data-visualization" element={<DataVisualization />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/car-listing" element={<CarListing />} />
            <Route path="/my-listings" element={<UserListings />} />
            <Route path="/my-listings-debug" element={<MyListingsDebug />} />
            <Route path='/listingdetails' element={<ListingDetail />} />
            <Route path="/car-marketplace" element={<CarMarketplace />} />
            {/* Protected Admin Dashboard Route */}
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;