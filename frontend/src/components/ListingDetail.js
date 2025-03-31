import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Divider,
  Button,
  useTheme,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  styled,
  alpha,
  IconButton,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  ColorLens as ColorIcon,
  LocalGasStation as FuelIcon,
  Settings as GearboxIcon,
  Description as DescriptionIcon,
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  CalendarToday as YearIcon,
  Category as CategoryIcon,
  ArrowForward,
  Person,
  Phone,
  Email,
  Chat,
  Share,
  Favorite,
  FavoriteBorder,
  CheckCircle,
  Send,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getListingById } from '../api';

const CAR_PLACEHOLDER = 'https://via.placeholder.com/800x500?text=No+Image+Available';

// Styled components for better UI
const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const DetailIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: alpha(theme.palette.common.black, 0.5),
  color: 'white',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.7),
  },
  zIndex: 10,
}));

const ContactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
  },
}));

const SellerAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const ListingDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [previousPath, setPreviousPath] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    document.title = `Vehicle Details - ${id}`;
    
    // Get referrer if available, or use a default path
    const referrer = document.referrer;
    const fromPath = referrer ? new URL(referrer).pathname : '/car-marketplace';
    setPreviousPath(fromPath);
    
    const fetchListing = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error("No listing ID provided");
        }

        // Use the API function from api.js
        const data = await getListingById(id);
        
        if (data) {
          setListing(data);
          
          // Check if the listing belongs to the current user
          if (isAuthenticated && user && data.owner_id === user._id) {
            setIsOwnListing(true);
          }
        } else {
          throw new Error("Failed to fetch listing details");
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(`Failed to load listing details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user, isAuthenticated]);

  // Function to get image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return CAR_PLACEHOLDER;     
    
    if (typeof imageName === 'object') {
      if (imageName.url) return imageName.url;
      if (imageName.path) return `http://localhost:8000/uploads/${imageName.path}`;
      return CAR_PLACEHOLDER;
    }
    
    if (typeof imageName === 'string') {
      return `http://localhost:8000/uploads/${imageName}`;
    }
    
    return CAR_PLACEHOLDER;
  };

  // Format date
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

  const handleNextImage = () => {
    if (listing?.images?.length > 1) {
      setMainImage((prev) => (prev + 1) % listing.images.length);
    }
  };

  const handlePrevImage = () => {
    if (listing?.images?.length > 1) {
      setMainImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const handleBackNavigation = () => {
    if (previousPath) {
        navigate(previousPath);
    } else if (window.history.length > 1) {
        navigate(-1); // Use history navigation as fallback
    } else {
        navigate('/car-marketplace'); // Default fallback
    }
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to save favorites',
        severity: 'info'
      });
      return;
    }
    
    setFavorite(!favorite);
    setSnackbar({
      open: true,
      message: favorite ? 'Removed from favorites' : 'Added to favorites',
      severity: 'success'
    });
  };

  const handleOpenMessageDialog = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to contact the seller',
        severity: 'info'
      });
      return;
    }
    setOpenMessageDialog(true);
  };

  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
  };

  const handleSendMessage = () => {
    // Here you would implement the actual message sending functionality
    if (message.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please enter a message',
        severity: 'warning'
      });
      return;
    }
    
    console.log('Sending message:', message);
    
    // Mock success for now
    setSnackbar({
      open: true,
      message: 'Message sent successfully',
      severity: 'success'
    });
    
    setMessage('');
    handleCloseMessageDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleShareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.make} ${listing.model} ${listing.year}`,
        text: `Check out this ${listing.year} ${listing.make} ${listing.model} on VehicleSouq!`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'URL copied to clipboard',
        severity: 'success'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading listing details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          Unable to load the listing details. The listing might not exist or there might be a server issue.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)} 
          startIcon={<BackIcon />}
        >
          Go Back to Listings
        </Button>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography variant="h6">Listing not found</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)} 
          startIcon={<BackIcon />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={handleBackNavigation}
        >
          Back to Listings
        </Button>
        
        <Box>
          <Tooltip title="Share this listing">
            <IconButton onClick={handleShareListing} color="primary">
              <Share />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={favorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton onClick={toggleFavorite} color="primary">
              {favorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Title and price section */}
      <DetailSection>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center">
              <CarIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {listing.title || `${listing.make} ${listing.model} ${listing.year}`}
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Listed on {formatDate(listing.created_at)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              EGP {Number(listing.price).toLocaleString()}
            </Typography>
            <Chip 
              label={listing.condition || 'Used'} 
              color={listing.condition === 'New' ? 'success' : 'default'}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </DetailSection>
      
      {/* Images section */}
      <DetailSection>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Photos
        </Typography>
        
        {listing.images && listing.images.length > 0 ? (
          <Box>
            {/* Main image */}
            <Box 
              sx={{ 
                width: '100%', 
                height: { xs: 300, md: 500 }, 
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <img 
                src={getImageUrl(listing.images[mainImage])} 
                alt={`${listing.make} ${listing.model} - Main`} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                }}
              />
              
              {listing.images.length > 1 && (
                <>
                  <ArrowButton
                    onClick={handlePrevImage}
                    sx={{ left: 8 }}
                  >
                    <BackIcon />
                  </ArrowButton>
                  <ArrowButton
                    onClick={handleNextImage}
                    sx={{ right: 8 }}
                  >
                    <ArrowForward />
                  </ArrowButton>
                </>
              )}
            </Box>
            
            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <ImageList 
                cols={Math.min(listing.images.length, 6)} 
                rowHeight={80} 
                gap={8}
                sx={{ mb: 0 }}
              >
                {listing.images.map((img, index) => (
                  <ImageListItem 
                    key={index} 
                    onClick={() => setMainImage(index)}
                    sx={{ 
                      cursor: 'pointer', 
                      border: index === mainImage ? `2px solid ${theme.palette.primary.main}` : 'none',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: index === mainImage ? `0 0 0 2px ${theme.palette.primary.main}` : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Thumbnail ${index + 1}`}
                      style={{ height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              height: 300, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              bgcolor: 'grey.100',
              borderRadius: 2
            }}
          >
            <Typography color="text.secondary">No images available</Typography>
          </Box>
        )}
      </DetailSection>
      
      {/* Details section */}
      <DetailSection>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Vehicle Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DetailItem>
              <DetailIcon>
                <SpeedIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Kilometers</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.kilometers?.toLocaleString() || 'N/A'} km
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <YearIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Year</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.year || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <CategoryIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Body Type</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.bodyType || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <FuelIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.fuelType || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DetailItem>
              <DetailIcon>
                <ColorIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Color</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.color || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <GearboxIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Transmission</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.transmissionType === 'automatic' ? 'Automatic' : 
                   listing.transmissionType === 'manual' ? 'Manual' : 
                   listing.transmissionType || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <LocationIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.location || 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
            
            <DetailItem>
              <DetailIcon>
                <CarIcon />
              </DetailIcon>
              <Box>
                <Typography variant="body2" color="text.secondary">Engine Capacity</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.cc ? `${listing.cc} cc` : 'N/A'}
                </Typography>
              </Box>
            </DetailItem>
          </Grid>
        </Grid>
      </DetailSection>
      
      {/* Description section */}
      <DetailSection>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Description
        </Typography>
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {listing.description || 'No description provided.'}
        </Typography>
      </DetailSection>
      
      {/* Seller Information - Only show if it's not the user's own listing */}
      {!isOwnListing && (
        <ContactCard>
          <Grid container>
            <Grid item xs={12} md={8}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Seller Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <SellerAvatar>
                    {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'S'}
                  </SellerAvatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {listing.owner_name || 'Seller'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.location}
                    </Typography>
                    
                    {listing.showMobileNumber && listing.mobileNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Phone sx={{ fontSize: 18, mr: 1, color: theme.palette.success.main }} />
                        <Typography variant="body2">
                          +20 {listing.mobileNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.light, 0.05),
              p: 3
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Chat />}
                size="large"
                onClick={handleOpenMessageDialog}
                sx={{ mb: 2 }}
              >
                Message Seller
              </Button>
              
              {listing.showMobileNumber && listing.mobileNumber && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Phone />}
                  href={`tel:+20${listing.mobileNumber}`}
                >
                  Call Seller
                </Button>
              )}
            </Grid>
          </Grid>
        </ContactCard>
      )}
      
      {/* Message Dialog */}
      <Dialog 
        open={openMessageDialog} 
        onClose={handleCloseMessageDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Message to Seller
          </Typography>
          <Typography variant="body2" color="text.secondary">
            About: {listing.make} {listing.model} {listing.year}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            label="Your message"
            placeholder="Hi, I'm interested in your car. Is it still available?"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseMessageDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            color="primary"
            startIcon={<Send />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListingDetail;
