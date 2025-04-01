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
  AttachMoney,
  ContentCopy,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getListingById } from '../api';

const CAR_PLACEHOLDER = 'https://via.placeholder.com/800x500?text=No+Image+Available';

const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
}));

const FeatureChip = styled(Chip)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: color ? alpha(color, 0.1) : alpha(theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  fontWeight: 500,
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: { xs: 300, md: 500 },
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
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
  const [sendingMessage, setSendingMessage] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    document.title = `Vehicle Details | Marketplace`;

    const fetchListing = async () => {
      try {
        setLoading(true);

        if (!id) {
          throw new Error('No listing ID provided');
        }

        const data = await getListingById(id);

        if (data) {
          setListing(data);

          if (user && data.owner_id === user._id) {
            setIsOwnListing(true);
          }
        } else {
          throw new Error('Failed to fetch listing details');
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
        severity: 'info',
      });
      return;
    }

    setFavorite(!favorite);
    setSnackbar({
      open: true,
      message: favorite ? 'Removed from favorites' : 'Added to favorites',
      severity: 'success',
    });
  };

  const handleOpenMessageDialog = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to contact the seller',
        severity: 'info',
      });
      return;
    }
    setOpenMessageDialog(true);
    setMessage(`Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`);
  };

  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please enter a message',
        severity: 'warning',
      });
      return;
    }

    setSendingMessage(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: listing.owner_id,
          content: message,
          listing_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSnackbar({
        open: true,
        message: 'Message sent successfully! The seller will respond soon.',
        severity: 'success',
      });

      setMessage('');
      handleCloseMessageDialog();

      navigate(`/messages/${listing.owner_id}`);
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleShareListing = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${listing.make} ${listing.model} ${listing.year}`,
          text: `Check out this ${listing.year} ${listing.make} ${listing.model} on VehicleSouq!`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'URL copied to clipboard',
        severity: 'success',
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
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          Unable to load the vehicle details. The listing might not exist or there might be a server issue.
        </Typography>
        <Button variant="contained" onClick={handleBackToMarketplace} startIcon={<BackIcon />} sx={{ mt: 1 }}>
          Back to Marketplace
        </Button>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography variant="h6" gutterBottom>
          Listing not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The vehicle you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={handleBackToMarketplace} startIcon={<BackIcon />} sx={{ mt: 1 }}>
          Explore Other Cars
        </Button>
      </Box>
    );
  }

  if (isOwnListing) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Typography variant="h6" gutterBottom>
          This is your own listing
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You are viewing your own car listing. To manage your listings, please go to your dashboard.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={handleBackToMarketplace} startIcon={<BackIcon />}>
            Back to Marketplace
          </Button>
          <Button variant="contained" onClick={() => navigate('/my-listings')} startIcon={<Person />}>
            My Listings
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBackToMarketplace} size="large">
          Back to Marketplace
        </Button>

        <Box>
          <Tooltip title="Share this vehicle">
            <IconButton onClick={handleShareListing} color="primary" sx={{ mx: 1 }}>
              <Share />
            </IconButton>
          </Tooltip>

          <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton onClick={toggleFavorite} color={favorite ? 'error' : 'default'}>
              {favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    <AttachMoney sx={{ mr: 1, fontSize: 24, verticalAlign: 'middle' }} />
                    EGP {Number(listing.price).toLocaleString()}
                  </Typography>

                  <Box>
                    <FeatureChip
                      label={listing.condition || 'Used'}
                      color={listing.condition === 'New' ? theme.palette.success.main : theme.palette.info.main}
                      icon={<Info />}
                    />
                    <FeatureChip label={listing.location} color={theme.palette.warning.main} icon={<LocationIcon />} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DetailSection>

          <DetailSection>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                Vehicle Photos
              </Typography>

              {listing.images && listing.images.length > 0 ? (
                <Box>
                  <ImageContainer>
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
                        <IconButton
                          onClick={handlePrevImage}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 8,
                            transform: 'translateY(-50%)',
                            backgroundColor: alpha(theme.palette.common.black, 0.5),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.black, 0.7),
                            },
                          }}
                        >
                          <BackIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleNextImage}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 8,
                            transform: 'translateY(-50%)',
                            backgroundColor: alpha(theme.palette.common.black, 0.5),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.common.black, 0.7),
                            },
                          }}
                        >
                          <ArrowForward />
                        </IconButton>
                      </>
                    )}
                  </ImageContainer>

                  {listing.images.length > 1 && (
                    <ImageList cols={Math.min(listing.images.length, 6)} rowHeight={80} gap={8} sx={{ mb: 0 }}>
                      {listing.images.map((img, index) => (
                        <ImageListItem
                          key={index}
                          onClick={() => setMainImage(index)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: index === mainImage ? `2px solid ${theme.palette.primary.main}` : 'none',
                            boxShadow:
                              index === mainImage
                                ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 8px rgba(0,0,0,0.1)`
                                : '0 2px 4px rgba(0,0,0,0.05)',
                            transform: index === mainImage ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
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
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">No images available</Typography>
                </Box>
              )}
            </Box>
          </DetailSection>

          <DetailSection>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Vehicle Specifications
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CarIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Make & Model
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.make} {listing.model}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <YearIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.year || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <SpeedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Kilometers
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.kilometers?.toLocaleString() || 'N/A'} km
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CategoryIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Body Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.bodyType || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <FuelIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fuel Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.fuelType || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <GearboxIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Transmission
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.transmissionType === 'automatic'
                        ? 'Automatic'
                        : listing.transmissionType === 'manual'
                        ? 'Manual'
                        : listing.transmissionType || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <ColorIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Color
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.color || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing(2),
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CarIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Engine Capacity
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.cc ? `${listing.cc} cc` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DetailSection>

          <DetailSection>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DescriptionIcon sx={{ mr: 1 }} />
              Description
            </Typography>

            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
                color: theme.palette.text.primary,
              }}
            >
              {listing.description || 'No description provided by the seller.'}
            </Typography>
          </DetailSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Contact Seller
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {listing.owner_name || 'Seller'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                      {listing.location}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {listing.showPhoneNumber && listing.phoneNumber ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Phone Number
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          {listing.phoneNumber}
                        </Typography>
                      </Box>
                      <Tooltip title="Copy number">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(listing.phoneNumber);
                            setSnackbar({
                              open: true,
                              message: 'Phone number copied to clipboard',
                              severity: 'success',
                            });
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      size="large"
                      startIcon={<Phone />}
                      href={`tel:${listing.phoneNumber}`}
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Call Seller
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" align="center" color="text.secondary">
                      <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Seller has not provided a phone number
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Chat />}
                  onClick={handleOpenMessageDialog}
                  sx={{ mb: 2 }}
                >
                  Message Seller
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                  Always meet in public places. Never pay in advance.
                </Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="warning.dark"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Info color="warning" sx={{ mr: 1 }} />
                  Safety Tips
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" paragraph>
                  • Meet in a safe, public place
                </Typography>
                <Typography variant="body2" paragraph>
                  • Verify vehicle documentation
                </Typography>
                <Typography variant="body2">• Never send money in advance</Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openMessageDialog} onClose={handleCloseMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Send Message to Seller
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseMessageDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            startIcon={sendingMessage ? <CircularProgress size={20} color="inherit" /> : <Send />}
            disabled={!message.trim() || sendingMessage}
          >
            {sendingMessage ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarketplaceCarDetail;