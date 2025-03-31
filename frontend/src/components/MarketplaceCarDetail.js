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
  CardMedia,
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
  Stack,
  Badge,
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
  Money,
  Info,
  VerifiedUser,
  Star,
  StarOutline,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getListingById } from '../api';

const CAR_PLACEHOLDER = 'https://via.placeholder.com/800x500?text=No+Image+Available';

// Styled components for better UI
const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },
}));

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  color: theme.palette.common.white,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  fontWeight: 'bold',
  zIndex: 1,
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
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
  width: 70,
  height: 70,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  border: `3px solid ${theme.palette.background.paper}`,
}));

const FeatureChip = styled(Chip)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: color ? alpha(color, 0.1) : alpha(theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  fontWeight: 500,
  border: 'none',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: { xs: 300, md: 500 },
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}));

const MarketplaceCarDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    document.title = `Vehicle Details | Marketplace`;
    
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
          if (user && data.owner_id === user._id) {
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
  }, [id, user]);

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

  const handleBackToMarketplace = () => {
    navigate('/car-marketplace');
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
      message: 'Message sent successfully! Seller will contact you soon.',
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
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="body1" sx={{ ml: 2, fontWeight: 500 }}>
          Loading vehicle details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          Unable to load the vehicle details. The listing might not exist or there might be a server issue.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBackToMarketplace} 
          startIcon={<BackIcon />}
          sx={{ mt: 1 }}
        >
          Back to Marketplace
        </Button>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography variant="h6" gutterBottom>Listing not found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The vehicle you're looking for doesn't exist or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBackToMarketplace} 
          startIcon={<BackIcon />}
          sx={{ mt: 1 }}
        >
          Explore Other Cars
        </Button>
      </Box>
    );
  }

  // Don't show messaging UI for your own listings
  if (isOwnListing) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography variant="h6" gutterBottom>This is your own listing</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You are viewing your own car listing. To manage your listings, please go to your dashboard.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button 
            variant="outlined" 
            onClick={handleBackToMarketplace} 
            startIcon={<BackIcon />}
          >
            Back to Marketplace
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/my-listings')} 
            startIcon={<Person />}
          >
            My Listings
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Top Navigation Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={handleBackToMarketplace}
          size="large"
        >
          Back to Marketplace
        </Button>
        
        <Box>
          <Tooltip title="Share this vehicle">
            <IconButton onClick={handleShareListing} color="primary" sx={{ mx: 1 }}>
              <Share />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={favorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton onClick={toggleFavorite} color={favorite ? "error" : "default"}>
              {favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left Column - Car Details */}
        <Grid item xs={12} md={8}>
          {/* Title and Price Section */}
          <DetailSection>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <CarIcon color="primary" sx={{ mr: 1, fontSize: 36 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {listing.title || `${listing.make} ${listing.model} ${listing.year}`}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Listed on {formatDate(listing.created_at)}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <PriceTag>
                    <AttachMoney sx={{ mr: 1 }} />
                    EGP {Number(listing.price).toLocaleString()}
                  </PriceTag>
                  
                  <Box>
                    <FeatureChip 
                      label={listing.condition || 'Used'} 
                      color={listing.condition === 'New' ? theme.palette.success.main : theme.palette.info.main}
                      icon={<Info />}
                    />
                    <FeatureChip 
                      label={listing.location} 
                      color={theme.palette.warning.main}
                      icon={<LocationIcon />}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DetailSection>
          
          {/* Images Gallery Section */}
          <DetailSection>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                Vehicle Photos
              </Typography>
              
              {listing.images && listing.images.length > 0 ? (
                <Box>
                  {/* Main Image */}
                  <ImageContainer>
                    <PriceTag>
                      <AttachMoney sx={{ fontSize: 20, mr: 0.5 }} />
                      {Number(listing.price).toLocaleString()} EGP
                    </PriceTag>
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
                  </ImageContainer>
                  
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
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: index === mainImage ? `2px solid ${theme.palette.primary.main}` : 'none',
                            boxShadow: index === mainImage 
                              ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 8px rgba(0,0,0,0.1)` 
                              : '0 2px 4px rgba(0,0,0,0.05)',
                            transform: index === mainImage ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
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
            </Box>
          </DetailSection>
          
          {/* Specifications Section */}
          <DetailSection>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Vehicle Specifications
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DetailItem>
                  <DetailIcon>
                    <CarIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Make & Model</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.make} {listing.model}
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
                    <CategoryIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Body Type</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.bodyType || 'N/A'}
                    </Typography>
                  </Box>
                </DetailItem>
              </Grid>
              
              <Grid item xs={12} md={6}>
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
          
          {/* Description Section */}
          <DetailSection>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              Description
            </Typography>
            
            <Typography variant="body1" sx={{ 
              whiteSpace: 'pre-line',
              lineHeight: 1.7,
              color: theme.palette.text.primary
            }}>
              {listing.description || 'No description provided by the seller.'}
            </Typography>
          </DetailSection>
        </Grid>
        
        {/* Right Column - Seller Info & Contact */}
        <Grid item xs={12} md={4}>
          {/* Seller Info */}
          <Box sx={{ position: 'sticky', top: 20 }}>
            <ContactCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  bgcolor: theme.palette.primary.main, 
                  p: 2, 
                  color: 'white',
                  borderTopLeftRadius: theme.spacing(2),
                  borderTopRightRadius: theme.spacing(2),
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    Seller Information
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  mt: -3,
                  mb: 2,
                  pt: 3
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title="Verified Seller">
                        <VerifiedUser color="primary" sx={{ fontSize: 24, bgcolor: 'white', borderRadius: '50%' }} />
                      </Tooltip>
                    }
                  >
                    <SellerAvatar>
                      {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'S'}
                    </SellerAvatar>
                  </Badge>
                  
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    {listing.owner_name || 'Seller'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {listing.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= 4 ? 
                        <Star key={star} sx={{ color: theme.palette.warning.main, fontSize: 18 }} /> : 
                        <StarOutline key={star} sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                    ))}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      (4.0)
                    </Typography>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 3 }}>
                  {/* Phone Number if available */}
                  {listing.showMobileNumber && listing.mobileNumber && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Contact Number
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        p: 1.5,
                        borderRadius: 1,
                        mb: 2
                      }}>
                        <Phone sx={{ color: theme.palette.success.main, mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          +20 {listing.mobileNumber}
                        </Typography>
                      </Box>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        startIcon={<Phone />}
                        href={`tel:+20${listing.mobileNumber}`}
                        sx={{ mb: 2 }}
                      >
                        Call Seller
                      </Button>
                    </Box>
                  )}
                  
                  {/* Message Option */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Chat />}
                    onClick={handleOpenMessageDialog}
                    sx={{ 
                      py: 1.5, 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    Message Seller
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Mention VehicleSouq when contacting the seller for better response
                  </Typography>
                </Box>
              </CardContent>
            </ContactCard>
            
            {/* Safety Tips Card */}
            <Card sx={{ 
              borderRadius: theme.spacing(2), 
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  p: 2, 
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Info color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium" color="warning.dark">
                    Safety Tips
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    • Meet in a safe, public place for viewing
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Test drive only after verifying documents
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Verify all vehicle documents before purchase
                  </Typography>
                  <Typography variant="body2">
                    • Never send money in advance
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
      
      {/* Message Dialog */}
      <Dialog 
        open={openMessageDialog} 
        onClose={handleCloseMessageDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold">
            Message to Seller
          </Typography>
          <Typography variant="body2" color="text.secondary">
            About: {listing.make} {listing.model} {listing.year}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            label="Your message"
            placeholder="Hi, I'm interested in your car. Is it still available? I would like to arrange a viewing."
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <Box sx={{ mt: 2, bgcolor: alpha(theme.palette.info.main, 0.1), p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <b>Tip:</b> Be specific about when you'd like to view the car and ask any important questions upfront.
            </Typography>
          </Box>
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
            disabled={!message.trim()}
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
          sx={{ width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarketplaceCarDetail;