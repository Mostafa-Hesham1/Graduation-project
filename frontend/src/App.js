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
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }
  
  return isAuthenticated && isAdmin ? children : null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ResponsiveAppBar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0, minHeight: '80vh' }}>
          <Routes>
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