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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Backdrop,
  Alert,
  AlertTitle,
  Tooltip,
  Snackbar,
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
  Build as BuildIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  PhotoLibrary as PhotoLibraryIcon,
  BugReport as BugReportIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getListingById } from '../api';
import axios from 'axios';

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
  const [damageDialogOpen, setDamageDialogOpen] = useState(false);
  const [damageAnalysisInProgress, setDamageAnalysisInProgress] = useState(false);
  const [damageAnalysisStep, setDamageAnalysisStep] = useState(0);
  const [damageAnalysisComplete, setDamageAnalysisComplete] = useState(false);
  const [damageAnalysisResults, setDamageAnalysisResults] = useState(null);
  const [damageAnalysisError, setDamageAnalysisError] = useState(null);
  const [totalDamageCount, setTotalDamageCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageAnalysisProgress, setImageAnalysisProgress] = useState(0);

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
          
          // Check if car is in user's favorites
          if (isAuthenticated && user) {
            checkIfFavorite(id);
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
  }, [id, user, isAuthenticated]);

  // Add this new function to check if car is in favorites
  const checkIfFavorite = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/profile/favorite-cars`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isFavorite = data.favorite_cars.some(fav => fav.car_id === carId);
        setFavorite(isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Replace the toggleFavorite function with this enhanced version
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to add favorites',
        severity: 'warning'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (favorite) {
        // Remove from favorites
        const response = await axios.delete(`http://localhost:8000/profile/favorite-cars/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 'success') {
          setFavorite(false);
          setSnackbar({
            open: true,
            message: 'Removed from favorites',
            severity: 'success'
          });
        }
      } else {
        // Add to favorites using the car_routes endpoint with comprehensive data
        const response = await axios.post(`http://localhost:8000/car/favorite/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 'success') {
          setFavorite(true);
          setSnackbar({
            open: true,
            message: 'Added to favorites',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update favorites',
        severity: 'error'
      });
    }
  };

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

  // Handle opening the damage detection dialog
  const handleOpenDamageDialog = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to access the damage detection feature',
        severity: 'warning'
      });
      return;
    }
    setDamageDialogOpen(true);
    setDamageAnalysisInProgress(false);
    setDamageAnalysisStep(0);
    setDamageAnalysisComplete(false);
    setDamageAnalysisResults(null);
    setDamageAnalysisError(null);
    setTotalDamageCount(0);
    setCurrentImageIndex(0);
    setImageAnalysisProgress(0);
  };

  // Handle closing the damage detection dialog
  const handleCloseDamageDialog = () => {
    if (damageAnalysisInProgress) {
      setSnackbar({
        open: true,
        message: 'Please wait until analysis is complete',
        severity: 'warning'
      });
      return;
    }
    setDamageDialogOpen(false);
  };

  // Start the damage analysis process
  const startDamageAnalysis = async () => {
    if (!listing || !listing.images || listing.images.length === 0) {
      setDamageAnalysisError("No images available for analysis");
      return;
    }

    setDamageAnalysisInProgress(true);
    setDamageAnalysisStep(1);
    setDamageAnalysisError(null);
    setDamageAnalysisResults(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // First create a new damage report entry
      const reportResponse = await axios.post(
        'http://localhost:8000/damage/create-report',
        {
          car_id: id,
          car_title: listing.title || `${listing.make} ${listing.model} ${listing.year}`,
          total_images: listing.images.length
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const reportId = reportResponse.data.report_id;
      const results = [];
      let totalDamages = 0;
      
      // Process each image using YOLO model
      for (let i = 0; i < listing.images.length; i++) {
        setCurrentImageIndex(i);
        setImageAnalysisProgress(0);
        
        // Update progress calculation
        const overallProgress = Math.round(((i) / listing.images.length) * 100);
        setDamageAnalysisStep(2);
        setImageAnalysisProgress(overallProgress);
        
        // Get image URL
        const imageUrl = getImageUrl(listing.images[i]);
        console.log(`Processing image ${i + 1}/${listing.images.length}: ${imageUrl}`);
        
        if (!imageUrl || imageUrl.includes('placeholder')) {
          console.log(`Skipping placeholder image ${i + 1}`);
          continue;
        }
        
        try {
          // Use the new detect-from-url endpoint with YOLO model
          const formData = new FormData();
          formData.append('image_url', imageUrl);
          formData.append('reduce_reflection', 'true');
          formData.append('enhance_contrast', 'true');
          formData.append('confidence_threshold', '0.25');
          formData.append('model_type', 'yolo'); // Explicitly use YOLO
          
          console.log(`Sending request to damage detection API for image ${i + 1}`);
          
          // Call the new YOLO damage detection endpoint
          const damageResponse = await axios.post(
            'http://localhost:8000/damage/detect-from-url',
            formData,
            {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setImageAnalysisProgress(progress);
                }
              }
            }
          );
          
          console.log(`Damage detection response for image ${i + 1}:`, damageResponse.data);
          
          if (damageResponse.data.status === 'success') {
            const imageDamageCount = Object.values(damageResponse.data.damage_counts || {}).reduce(
              (sum, count) => sum + count, 0
            );
            
            totalDamages += imageDamageCount;
            
            results.push({
              image_index: i,
              image_url: imageUrl,
              annotated_image: damageResponse.data.annotated_image,
              detections: damageResponse.data.detections || [],
              damage_counts: damageResponse.data.damage_counts || {},
              damage_crops: damageResponse.data.damage_crops || [],
              total_damages: imageDamageCount
            });
            
            // Update report with each image result
            await axios.post(
              `http://localhost:8000/damage/update-report/${reportId}/image/${i}`,
              {
                annotated_image: damageResponse.data.annotated_image,
                detections: damageResponse.data.detections || [],
                damage_counts: damageResponse.data.damage_counts || {},
                damage_crops: damageResponse.data.damage_crops || [],
                total_damages: imageDamageCount
              },
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
          }
        } catch (imageError) {
          console.error(`Error processing image ${i + 1}:`, imageError);
          console.error('Error details:', imageError.response?.data || imageError.message);
          
          // Log the specific error for debugging
          if (imageError.response?.status === 400) {
            console.error('Bad Request error - likely issue with image URL or format');
          }
          
          // Continue with next image instead of failing completely
          continue;
        }
      }
      
      // Complete the report
      await axios.post(
        `http://localhost:8000/damage/complete-report/${reportId}`,
        {
          total_damages: totalDamages,
          status: 'completed'
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setTotalDamageCount(totalDamages);
      setDamageAnalysisResults(results);
      setDamageAnalysisComplete(true);
      setDamageAnalysisStep(3);
      
      // Notify the user that the report is ready
      setSnackbar({
        open: true,
        message: `Damage analysis complete! Found ${totalDamages} damage instances using YOLO detection. Report saved to your profile.`,
        severity: 'success'
      });
      
      // Optional: Add a button to view the report immediately
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'You can view the detailed report in your Profile > Damage Reports section.',
          severity: 'info'
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error during damage analysis:', error);
      console.error('Full error details:', error.response?.data || error.message);
      setDamageAnalysisError(error.response?.data?.detail || error.message || 'Failed to analyze damage');
      setDamageAnalysisStep(4); // Error step
    } finally {
      setDamageAnalysisInProgress(false);
    }
  };

  // Render damage detection dialog content
  const renderDamageDialogContent = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={damageAnalysisStep} orientation="vertical">
          <Step>
            <StepLabel>Start Damage Analysis</StepLabel>
            <StepContent>
              <Typography variant="body2" paragraph>
                The system will analyze all {listing?.images?.length || 0} images of this vehicle to detect potential damage.
              </Typography>
              <Typography variant="body2" paragraph>
                Results will be saved to your profile dashboard for future reference.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={startDamageAnalysis}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={damageAnalysisInProgress}
                  startIcon={<BugReportIcon />}
                >
                  Start Analysis
                </Button>
                <Button
                  onClick={handleCloseDamageDialog}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={damageAnalysisInProgress}
                >
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>Preparing Analysis</StepLabel>
            <StepContent>
              <Typography variant="body2" paragraph>
                Setting up damage detection for this vehicle...
              </Typography>
              <LinearProgress sx={{ mb: 2 }} />
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>Analyzing Images</StepLabel>
            <StepContent>
              <Typography variant="body2" paragraph>
                Analyzing image {currentImageIndex + 1} of {listing?.images?.length || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={imageAnalysisProgress} 
                sx={{ mb: 2 }} 
              />
              <Typography variant="caption" color="text.secondary">
                Please wait, this may take a few minutes...
              </Typography>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>Analysis Complete</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="bold" color="primary" paragraph>
                  <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Analysis completed successfully!
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Report Created</AlertTitle>
                  A detailed damage report has been saved to your profile dashboard.
                </Alert>
                
                <Paper sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Summary:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PhotoLibraryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${listing?.images?.length || 0} images analyzed`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ReportIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${totalDamageCount} total damage instances detected`}
                        secondary={totalDamageCount > 0 ? "See your profile for detailed report" : "No significant damage detected"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarTodayIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Report created on"
                        secondary={new Date().toLocaleString()}
                      />
                    </ListItem>
                  </List>
                </Paper>
                
                <Button
                  variant="contained"
                  onClick={handleCloseDamageDialog}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Close
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  sx={{ mt: 1 }}
                >
                  View Report in Profile
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          <Step>
            <StepLabel>Error</StepLabel>
            <StepContent>
              <Typography variant="body2" color="error" paragraph>
                {damageAnalysisError}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setDamageAnalysisStep(0);
                    setDamageAnalysisError(null);
                  }}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleCloseDamageDialog}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Close
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    );
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
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
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
                        bgcolor: alpha(theme.palette.success.light, 0.1),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone color="success" sx={{ mr: 1 }} />
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

      {/* Add Damage Detection Button at the end of the content section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* ...existing code... */}
          
          {/* Add Damage Detection Button */}
          <DetailSection sx={{ mt: 3 }}>
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
              <BuildIcon sx={{ mr: 1 }} />
              Vehicle Damage Detection
            </Typography>

            <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" paragraph>
                Use our AI-powered damage detection to analyze all images of this vehicle and generate a comprehensive damage report.
              </Typography>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<BugReportIcon />}
                onClick={handleOpenDamageDialog}
                sx={{ mt: 1 }}
              >
                Check Vehicle Damage
              </Button>
            </Box>
          </DetailSection>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* ...existing code for the right column... */}
        </Grid>
      </Grid>
      
      {/* Damage Detection Dialog */}
      <Dialog
        open={damageDialogOpen}
        onClose={handleCloseDamageDialog}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={damageAnalysisInProgress}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BugReportIcon sx={{ mr: 1 }} color="error" />
            <Typography variant="h6">Vehicle Damage Analysis</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {renderDamageDialogContent()}
        </DialogContent>
        
        {!damageAnalysisInProgress && !damageAnalysisComplete && (
          <DialogActions>
            <Button onClick={handleCloseDamageDialog}>Cancel</Button>
          </DialogActions>
        )}
      </Dialog>
      
      {/* Backdrop for processing */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={damageAnalysisInProgress}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing vehicle images...
          </Typography>
          <Typography variant="body2">
            Please wait, this may take a few minutes
          </Typography>
        </Box>
      </Backdrop>
      
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

      {/* Message Dialog */}
      <Dialog open={openMessageDialog} onClose={handleCloseMessageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to Seller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={sendingMessage}
            startIcon={sendingMessage ? <CircularProgress size={20} /> : <Send />}
            size="medium"
          >
            {sendingMessage ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MarketplaceCarDetail;