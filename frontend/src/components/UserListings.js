import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Base64 encoded placeholder SVG for missing images
const CAR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNMTUwIDEzMEg1MEM0NS44MTc5IDEzMCA0Mi41IDEyNi42ODMgNDIuNSAxMjIuNVYxMTVDNDIuNSAxMTAuODE3IDQ1LjgxNzkgMTA3LjUgNTAgMTA3LjVIMTUwQzE1NC4xODIgMTA3LjUgMTU3LjUgMTEwLjgxNyAxNTcuNSAxMTVWMTIyLjVDMTU3LjUgMTI2LjY4MyAxNTQuMTgyIDEzMCAxNTAgMTMwWiIgZmlsbD0iIzljOWM5YyIvPjxjaXJjbGUgY3g9IjY1IiBjeT0iMTI1IiByPSIxMCIgZmlsbD0iIzU1NSIvPjxjaXJjbGUgY3g9IjEzNSIgY3k9IjEyNSIgcj0iMTAiIGZpbGw9IiM1NTUiLz48cGF0aCBkPSJNMTUwIDEwNy41SDUwTDYwIDgwSDEzMEwxNTAgMTA3LjVaIiBmaWxsPSIjOUM5QzlDIi8+PHRleHQgeD0iMTAwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM1NTUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const ListingCard = ({ listing }) => {
  const [mainImage, setMainImage] = useState(
    listing.images && listing.images[0] ? listing.images[0] : null
  );

  const getImageUrl = (imageName) => {
    if (!imageName || typeof imageName !== 'string') {
      return CAR_PLACEHOLDER;
    }
    const cleanName = imageName.trim();
    return cleanName
      ? `http://localhost:8000/uploads/${cleanName}`
      : CAR_PLACEHOLDER;
  };

  const handleImageError = (e) => {
    if (e.target.src !== CAR_PLACEHOLDER) {
      console.warn('Image load failed:', e.target.src);
      e.target.src = CAR_PLACEHOLDER;
      e.target.onerror = null;
    }
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 2 },
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Fixed Aspect Ratio Image Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          bgcolor: 'grey.100',
        }}
      >
        <img
          src={getImageUrl(mainImage)}
          alt={`${listing.make} ${listing.model}`}
          onError={handleImageError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Thumbnails for additional images */}
      {listing.images && listing.images.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            height: 50,
            p: 0.5,
            bgcolor: 'grey.50',
            overflowX: 'auto',
          }}
        >
          {listing.images.map((img, idx) => (
            <Box
              key={`thumb-${idx}`}
              component="img"
              src={getImageUrl(img)}
              alt={`Thumbnail ${idx + 1}`}
              onError={handleImageError}
              onClick={() => setMainImage(img)}
              sx={{
                height: '100%',
                mr: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                border: img === mainImage ? '2px solid blue' : 'none',
              }}
            />
          ))}
        </Box>
      )}

      {/* Listing Details */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {listing.title || `${listing.year} ${listing.make} ${listing.model}`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
            ${listing.price?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {listing.kilometers?.toLocaleString()} km
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {listing.fuelType && (
            <Chip label={listing.fuelType} size="small" variant="outlined" />
          )}
          {listing.transmissionType && (
            <Chip label={listing.transmissionType} size="small" variant="outlined" />
          )}
          {listing.condition && (
            <Chip
              label={listing.condition}
              color={listing.condition === 'New' ? 'success' : 'default'}
              size="small"
            />
          )}
        </Box>
        {listing.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {listing.description}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {listing.location && (
            <Typography variant="body2">📍 {listing.location}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {formatDate(listing.created_at)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small">Edit</Button>
        <Button size="small" color="error">
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

// Remove the inline getUserListings function and use the one from api.js
import { getUserListings } from '../api';

const UserListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadListings = async () => {
      try {
        setLoading(true);
        
        // Use the imported function instead of the local one
        const data = await getUserListings();
        setListings(data.listings || []);
        
      } catch (err) {
        console.error("Error loading listings:", err);
        setError(`${err.message}. Please try logging out and back in.`);
      } finally {
        setLoading(false);
      }
    };
    
    loadListings();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your listings...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          pb: 1,
          borderBottom: 2,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        My Car Listings
      </Typography>
      {listings.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No listings found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/car-listing')}
            sx={{ mt: 2 }}
          >
            Create New Listing
          </Button>
        </Paper>
      ) : (
        <Grid
          container
          spacing={3}
          justifyContent={listings.length === 1 ? 'center' : 'flex-start'}
        >
          {listings.map((listing) => (
            <Grid
              item
              xs={12}
              sm={listings.length === 1 ? 10 : 6}
              md={listings.length === 1 ? 8 : 4}
              key={listing._id}
            >
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserListings;