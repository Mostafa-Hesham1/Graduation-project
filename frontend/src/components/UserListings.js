import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  useTheme,
  styled,
  alpha,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  ColorLens as ColorIcon,
  CalendarToday as DateIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  FiberNew as NewIcon,
  LocalOffer as PriceIcon,
  Image as ImageIcon,
  Warning as WarningIcon,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { fetchUserListings } from '../api'; // Updated import name

const CAR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNMTUwIDEzMEg1MEM0NS44MTc5IDEzMCA0Mi41IDEyNi42ODMgNDIuNSAxMjIuNVYxMTVDNDIuNSAxMTAuODE3IDQ1LjgxNzkgMTA3LjUgNTAgMTA3LjVIMTUwQzE1NC4xODIgMTA3LjUgMTU3LjUgMTEwLjgxNyAxNTcuNSAxMTVWMTIyLjVDMTU3LjUgMTI2LjY4MyAxNTQuMTgyIDEzMCAxNTAgMTMwWiIgZmlsbD0iIzljOWM5YyIvPjxjaXJjbGUgY3g9IjY1IiBjeT0iMTI1IiByPSIxMCIgZmlsbD0iIzU1NSIvPjxjaXJjbGUgY3g9IjEzNSIgY3k9IjEyNSIgcj0iMTAiIGZpbGw9IiM1NTUiLz48cGF0aCBkPSJNMTUwIDEwNy41SDUwTDYwIDgwSDEzMEwxNTAgMTA3LjVaIiBmaWxsPSIjOUM5QzlDIi8+PHRleHQgeD0iMTAwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM1NTUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const PageHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const EmptyStateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px dashed ${theme.palette.divider}`,
}));

const ListingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
}));

const ListingCardMedia = styled('div')(({ theme }) => ({
  height: 180,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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

const StatusChip = styled(Chip)(({ theme, status }) => {
  let bgColor = theme.palette.primary.main;
  let textColor = 'white';

  if (status === 'Sold') {
    bgColor = theme.palette.success.main;
  } else if (status === 'Pending') {
    bgColor = theme.palette.warning.main;
  } else if (status === 'Inactive') {
    bgColor = theme.palette.grey[500];
  }

  return {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: bgColor,
    color: textColor,
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };
});

const ListingDetail = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const ListingDetailIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const UserListings = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  
  useEffect(() => {
    const fetchListings = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetchUserListings(); // Updated function call
        let listingsData = [];
        if (response.listings && Array.isArray(response.listings)) {
          listingsData = response.listings;
        } else if (Array.isArray(response)) {
          listingsData = response;
        }
        setListings(listingsData);
      } catch (err) {
        console.error('Error fetching user listings:', err);
        setError('Failed to load your listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (listings.length > 0) {
      const indices = {};
      listings.forEach(listing => {
        indices[listing._id] = 0;
      });
      setCurrentImageIndices(indices);
    }
  }, [listings]);
  
  const getImageUrl = (imageName) => {
    if (!imageName) {
      return CAR_PLACEHOLDER;
    }
    
    if (typeof imageName === 'object') {
      if (imageName.url) return imageName.url;
      if (imageName.path) return `http://localhost:8000/uploads/${imageName.path}`;
      return CAR_PLACEHOLDER;
    }
    
    if (typeof imageName === 'string') {
      const cleanName = imageName.trim();
      return cleanName
        ? `http://localhost:8000/uploads/${cleanName}`
        : CAR_PLACEHOLDER;
    }
    
    return CAR_PLACEHOLDER;
  };
  
  const handleViewListing = (event, listing) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("Navigating to my listing detail with ID:", listing._id);

    if (listing && listing._id) {
      navigate(`/my-listing/${listing._id}`);
    } else {
      console.error("Cannot navigate - listing ID is missing:", listing);
      setSnackbar({
        open: true,
        message: 'Error: Listing information is incomplete',
        severity: 'error',
      });
    }
  };
  
  const handleQuickView = (event, listing) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedListing(listing);
    setDetailDialogOpen(true);
  };
  
  const handleEditListing = (event, listingId) => {
    event.stopPropagation();
    navigate(`/edit-listing/${listingId}`);
  };
  
  const openDeleteDialog = (event, listing) => {
    event.stopPropagation();
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setListingToDelete(null);
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
  
  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    
    try {
      setListings(listings.filter(listing => listing._id !== listingToDelete._id));
      
      setSnackbar({
        open: true,
        message: 'Listing deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete listing',
        severity: 'error'
      });
    } finally {
      closeDeleteDialog();
    }
  };
  
  const handleCreateListing = () => {
    navigate('/car-listing');
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNextImage = (event, listingId, images) => {
    event.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndices(prev => ({
        ...prev,
        [listingId]: (prev[listingId] + 1) % images.length
      }));
    }
  };

  const handlePrevImage = (event, listingId, images) => {
    event.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndices(prev => ({
        ...prev,
        [listingId]: (prev[listingId] - 1 + images.length) % images.length
      }));
    }
  };
  
  if (!isAuthenticated) {
    return <CircularProgress />;
  }
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
            Loading your listings...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader>
        <Box display="flex" alignItems="center">
          <CarIcon fontSize="large" sx={{ mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            My Listings
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleCreateListing}
          sx={{
            borderRadius: theme.spacing(3),
            px: 3,
            py: 1,
            fontWeight: 'bold',
            backgroundColor: 'white',
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.9),
            },
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          Add New Listing
        </Button>
      </PageHeader>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: theme.spacing(1) }}>
          {error}
        </Alert>
      )}
      
      {!loading && listings.length === 0 ? (
        <EmptyStateContainer>
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <CarIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom>
              You haven't listed any cars yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start listing your cars for sale and manage all your listings from this dashboard.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateListing}
              sx={{ mt: 2, borderRadius: theme.spacing(3), px: 4 }}
            >
              List Your First Car
            </Button>
          </Box>
        </EmptyStateContainer>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing._id}>
              <ListingCard 
                onClick={(event) => handleViewListing(event, listing)}
                sx={{ cursor: 'pointer' }}
              >
                <ListingCardMedia
                  style={{
                    backgroundImage: `url(${listing.images && listing.images.length > 0 
                      ? getImageUrl(listing.images[currentImageIndices[listing._id] || 0])
                      : CAR_PLACEHOLDER})`
                  }}
                >
                  {listing.images && listing.images.length > 1 && (
                    <>
                      <ArrowButton 
                        onClick={(e) => handlePrevImage(e, listing._id, listing.images)}
                        sx={{ left: 8 }}
                      >
                        <ArrowBack />
                      </ArrowButton>
                      <ArrowButton 
                        onClick={(e) => handleNextImage(e, listing._id, listing.images)}
                        sx={{ right: 8 }}
                      >
                        <ArrowForward />
                      </ArrowButton>
                    </>
                  )}
                  <StatusChip 
                    label={listing.status || 'Active'} 
                    status={listing.status || 'Active'}
                    size="small"
                    icon={listing.status === 'New' ? <NewIcon fontSize="small" /> : undefined}
                  />
                </ListingCardMedia>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" noWrap>
                    {listing.make} {listing.model} {listing.year}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    fontWeight="bold" 
                    sx={{ mb: 2 }}
                  >
                    EGP {Number(listing.price).toLocaleString()}
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <ListingDetail>
                        <ListingDetailIcon>
                          <SpeedIcon fontSize="small" />
                        </ListingDetailIcon>
                        <Typography variant="body2">
                          {listing.kilometers?.toLocaleString() || listing.mileage?.toLocaleString() || 'N/A'} km
                        </Typography>
                      </ListingDetail>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <ListingDetail>
                        <ListingDetailIcon>
                          <ColorIcon fontSize="small" />
                        </ListingDetailIcon>
                        <Typography variant="body2" noWrap>
                          {listing.color || 'N/A'}
                        </Typography>
                      </ListingDetail>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <ListingDetail>
                        <ListingDetailIcon>
                          <LocationIcon fontSize="small" />
                        </ListingDetailIcon>
                        <Typography variant="body2" noWrap>
                          {listing.location || 'N/A'}
                        </Typography>
                      </ListingDetail>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <ListingDetail>
                        <ListingDetailIcon>
                          <DateIcon fontSize="small" />
                        </ListingDetailIcon>
                        <Typography variant="body2">
                          {formatDate(listing.created_at)}
                        </Typography>
                      </ListingDetail>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                  <Button 
                    startIcon={<ViewIcon />}
                    onClick={(e) => handleQuickView(e, listing)}
                    size="small"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Quick View
                  </Button>
                  
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={(e) => handleEditListing(e, listing._id)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => openDeleteDialog(e, listing)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </ListingCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedListing && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  {selectedListing.make} {selectedListing.model} {selectedListing.year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Listed on {formatDate(selectedListing.created_at)}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                EGP {Number(selectedListing.price).toLocaleString()}
              </Typography>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative', mb: { xs: 2, md: 0 } }}>
                    {selectedListing.images && selectedListing.images.length > 0 ? (
                      <img 
                        src={getImageUrl(selectedListing.images[0])}
                        alt={`${selectedListing.make} ${selectedListing.model}`}
                        style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: 300, 
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      }}>
                        <ImageIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.5 }} />
                      </Box>
                    )}
                    
                    {selectedListing.images && selectedListing.images.length > 1 && (
                      <Chip 
                        label={`+${selectedListing.images.length - 1} more photos`} 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 10, 
                          right: 10,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SpeedIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Kilometers:
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {selectedListing.kilometers?.toLocaleString() || selectedListing.mileage?.toLocaleString() || 'N/A'} km
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ColorIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Color:
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {selectedListing.color || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Location:
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {selectedListing.location || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PriceIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Price:
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                          EGP {Number(selectedListing.price).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedListing.description || 'No description provided.'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button 
                onClick={() => setDetailDialogOpen(false)}
                color="inherit"
              >
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={(event) => {
                  console.log("Full details button clicked for:", selectedListing._id);
                  setDetailDialogOpen(false);
                  navigate(`/my-listing/${selectedListing._id}`);
                }}
                startIcon={<ViewIcon />}
              >
                Full Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Delete Listing
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this listing?
            {listingToDelete && (
              <Box component="span" fontWeight="bold">
                {` ${listingToDelete.make} ${listingToDelete.model} ${listingToDelete.year}`}
              </Box>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteListing} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserListings;