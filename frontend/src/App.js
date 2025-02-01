import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import ResponsiveAppBar from './components/NavBar';
import ImageUpload from './components/ImageUpload';
import Scrape from './components/Scrape'; // Import the Scrape component
import PricePrediction from './components/PricePrediction'; // Import the PricePrediction component
import DataVisualization from './components/DataVisualization'; // Import the DataVisualization component
import SignUp from './components/SignUp'; // Import the SignUp component
import Login from './components/Login';
import Footer from './components/Footer'; // Import the Footer component
import { Typography, Box } from '@mui/material';
import CarListing from './components/CarListing'; // Import the CarListing component
import Home from './components/Home'; // Import the Home component

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ResponsiveAppBar />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0 }}>
          <Routes>
              <Route path="/" element={<Home />} /> {/* Set Home as the main page */}
              <Route path="/image-upload" element={<ImageUpload />} />
              <Route path="/car-recognizer" element={<ImageUpload />} /> {/* Rename route to Car Recognizer */}

              <Route path="/scrape" element={<Scrape />} /> {/* Add route for Scrape */}
              <Route path="/price-prediction" element={<PricePrediction />} /> {/* Add route for PricePrediction */}
              <Route path="/data-visualization" element={<DataVisualization />} /> {/* Add route for DataVisualization */}
              <Route path="/signup" element={<SignUp />} /> {/* Add route for SignUp */}
              <Route path="/login" element={<Login />} />
              <Route path="/car-listing" element={<CarListing />} />
            </Routes>
          </Box>
          <Footer /> {/* Render the Footer component */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
