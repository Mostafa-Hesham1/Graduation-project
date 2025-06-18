import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CircularProgress, Typography, Container } from '@mui/material';

// Direct imports for existing components
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
import ChatMessages from './components/ChatMessages'; // Changed import from MessagesPage to ChatMessages
import CarDetails from './components/CarDetails'; // Import CarDetails component
import EditCarListing from './components/EditCarListing'; // Import the new EditCarListing component
import Profile from './components/Profile';

// Import the new page components
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';

// Simple placeholders for missing components
const NotFound = () => (
  <Container sx={{ py: 5, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>404 - Page Not Found</Typography>
    <Typography variant="body1">The page you are looking for doesn't exist or has been moved.</Typography>
  </Container>
);

const Register = () => (
  <Container sx={{ py: 5, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>Register</Typography>
    <Typography variant="body1">We're currently using the SignUp component instead of Register.</Typography>
  </Container>
);

const MyListings = () => (
  <Container sx={{ py: 5, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>My Listings</Typography>
    <Typography variant="body1">We're currently using the UserListings component instead.</Typography>
  </Container>
);

const ListCar = () => (
  <Container sx={{ py: 5, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>List Your Car</Typography>
    <Typography variant="body1">We're currently using the CarListing component instead.</Typography>
  </Container>
);

const UserProfile = () => (
  <Container sx={{ py: 5, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>User Profile</Typography>
    <Typography variant="body1">This feature is coming soon.</Typography>
  </Container>
);

// Protected route component for admin-only routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Protected route for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ResponsiveAppBar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0, minHeight: '80vh' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} /> {/* Using SignUp instead of Register */}
            <Route path="/signup" element={<SignUp />} /> {/* Added route to fix 404 error */}
            
            {/* Car marketplace routes */}
            <Route path="/car-marketplace" element={<CarMarketplace />} />
            <Route path="/marketplace/:id" element={<MarketplaceCarDetail />} />
            <Route path="/marketplace/car/:id" element={<MarketplaceCarDetail />} />
            
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/car/:id" element={<MarketplaceCarDetail />} /> {/* Updated route path to match navigation */}
            <Route path="/car-recognizer" element={<ImageUpload />} />
            <Route path="/damage-detect" element={<DamageDetect />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            
            {/* Messages routes - Updated to use ChatMessages */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <ChatMessages />
              </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
              <ProtectedRoute>
                <ChatMessages />
              </ProtectedRoute>
            } />
            
            {/* Protected user routes */}
            <Route path="/my-listings" element={
              <ProtectedRoute>
                <UserListings /> {/* Using UserListings instead of MyListings */}
              </ProtectedRoute>
            } />
            <Route path="/my-listing/:id" element={
              <ProtectedRoute>
                <CarDetails /> {/* Added route for individual car details */}
              </ProtectedRoute>
            } />
            <Route path="/edit-listing/:id" element={
              <ProtectedRoute>
                <EditCarListing /> {/* Add new route for editing */}
              </ProtectedRoute>
            } />
            <Route path="/car-listing" element={
              <ProtectedRoute>
                <CarListing /> {/* Using CarListing instead of ListCar */}
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin only routes */}
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Footer Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;