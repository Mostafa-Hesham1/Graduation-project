import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ResponsiveAppBar from './components/NavBar';
import Home from './components/Home';
import ImageUpload from './components/ImageUpload';
import Scrape from './components/Scrape';
import PricePrediction from './components/PricePrediction';
import DataVisualization from './components/DataVisualization';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CarListing from './components/CarListing';
import UserListings from './components/UserListings';
import Footer from './components/Footer';
import { Box } from '@mui/material';

// Debug component for testing routes
const MyListingsDebug = () => {
  console.log("MyListingsDebug component rendering");
  return (
    <div style={{padding: 20}}>
      <h1>My Listings Debug View</h1>
      <p>This is a simple component to verify the route is working.</p>
      <p>If you can see this, the route is working but the UserListings component may have issues.</p>
    </div>
  );
};

function App() {
  console.log("App component rendering");
  return (
    <AuthProvider>
      <Router>
        <ResponsiveAppBar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0, minHeight: '80vh' }}>
          {/* Remove the RouteCheck component for now */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/car-recognizer" element={<ImageUpload />} />
            <Route path="/image-upload" element={<ImageUpload />} />
            <Route path="/scrape" element={<Scrape />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            <Route path="/data-visualization" element={<DataVisualization />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/car-listing" element={<CarListing />} />
            <Route path="/my-listings" element={<UserListings />} />
            <Route path="/my-listings-debug" element={<MyListingsDebug />} />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
