import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Divider,
  Chip,
  Button,
  Paper,
  CircularProgress,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  ColorLens as ColorIcon,
  CalendarToday as DateIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fix: Use the correct API endpoint path that matches the backend route
        const response = await fetch(`http://localhost:8000/api/cars/listing/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch car details (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setCarDetails(data);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError(err.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`http://localhost:8000/profile/favorite-cars/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setIsFavorite(response.data.isFavorite);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };
    
    checkFavoriteStatus();
  }, [id]);

  const getImageUrl = (imageName) => {
    if (!imageName) return '';
    
    if (typeof imageName === 'object') {
      if (imageName.url) return imageName.url;
      if (imageName.path) return `http://localhost:8000/uploads/${imageName.path}`;
      return '';
    }
    
    if (typeof imageName === 'string') {
      return `http://localhost:8000/uploads/${imageName}`;
    }
    
    return '';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Date not available';
    }
  };

  const handleGoBack = () => {
    navigate('/my-listings');
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }

    try {
      setIsFavoriteLoading(true);
      const token = localStorage.getItem('token');
      
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`http://localhost:8000/profile/favorite-cars/${carId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsFavorite(false);
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'success'
        });
      } else {
        // Add to favorites - use the new comprehensive endpoint
        await axios.post(`http://localhost:8000/car/favorite/${carId}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsFavorite(true);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update favorites',
        severity: 'error'
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
            Loading car details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Car Details
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Back to My Listings
          </Button>
        </Box>
      </Container>
    );
  }

  if (!carDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <Typography variant="h5" gutterBottom>
            Car Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The car listing you're looking for doesn't exist or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Back to My Listings
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back to My Listings
      </Button>
      
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: theme => `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CarIcon fontSize="large" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {carDetails.make} {carDetails.model} {carDetails.year}
              </Typography>
              <Typography variant="body1">
                Listed on {formatDate(carDetails.created_at)}
              </Typography>
            </Box>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            EGP {Number(carDetails.price).toLocaleString()}
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            {carDetails.images && carDetails.images.length > 0 ? (
              <Box sx={{ p: 2 }}>
                <img 
                  src={getImageUrl(carDetails.images[0])}
                  alt={`${carDetails.make} ${carDetails.model}`}
                  style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'cover' }}
                />
                
                {carDetails.images.length > 1 && (
                  <ImageList cols={4} gap={8} sx={{ mt: 2 }}>
                    {carDetails.images.slice(1).map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={getImageUrl(image)}
                          alt={`${carDetails.make} ${carDetails.model} - image ${index + 2}`}
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            ) : (
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'grey.100'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No images available
                </Typography>
              </Box>
            )}
          </Card>
          
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {carDetails.description || 'No description provided.'}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Additional Information
              </Typography>
              
              <Grid container spacing={2}>
                {carDetails.transmissionType && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Transmission:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {carDetails.transmissionType}
                    </Typography>
                  </Grid>
                )}
                
                {carDetails.fuelType && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fuel Type:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {carDetails.fuelType}
                    </Typography>
                  </Grid>
                )}
                
                {carDetails.bodyType && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Body Type:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {carDetails.bodyType}
                    </Typography>
                  </Grid>
                )}
                
                {carDetails.condition && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Condition:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {carDetails.condition}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 4, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Key Details
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SpeedIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Kilometers
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {carDetails.kilometers?.toLocaleString() || carDetails.mileage?.toLocaleString() || 'N/A'} km
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ColorIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Color
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {carDetails.color || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {carDetails.location || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DateIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Year
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {carDetails.year || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Status Information
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Listing Status:
                  </Typography>
                  <Chip 
                    label={carDetails.status || 'Active'} 
                    color={
                      carDetails.status === 'Sold' ? 'success' : 
                      carDetails.status === 'Pending' ? 'warning' : 
                      'primary'
                    }
                    size="small"
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="h5" gutterBottom align="center" fontWeight="bold" color="primary">
                  EGP {Number(carDetails.price).toLocaleString()}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate(`/edit-listing/${id}`)}
                  >
                    Edit Listing
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CarDetails;