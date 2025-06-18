import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Divider,
  Paper,
  useTheme,
  alpha,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  DirectionsCar, 
  Search, 
  LocalOffer, 
  Speed, 
  Settings,
  ArrowForward, 
  ErrorOutline,
  CheckCircleOutline,
  ImageSearch,
  AttachMoney
} from '@mui/icons-material';
import { fetchCarListings } from '../api'; 
import { useAuth } from '../context/AuthContext';

// Hero section with white design
const HeroSection = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  color: '#333333',
  padding: theme.spacing(5, 0),
  position: 'relative',
  overflow: 'hidden',
  borderBottom: '1px solid #eaeaea',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url(/hero-pattern.png)',
    backgroundSize: 'cover',
    opacity: 0.03,
    zIndex: 0,
  }
}));

// Feature card with hover effect
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
}));

// Section title with accent line
const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

// Car listing card with shadow and hover effect
const ListingCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
  },
}));

// Styled chip for car info
const ListingInfoChip = styled(Chip)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: color ? alpha(color, 0.1) : alpha(theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  border: 'none',
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured cars
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        // Fetch newest listings with limit of 4
        const response = await fetchCarListings({ 
          limit: 4, 
          sortBy: 'newest'
        });
        
        if (response && response.listings) {
          setFeaturedCars(response.listings);
        } else {
          setFeaturedCars([]);
        }
      } catch (err) {
        console.error('Error fetching featured cars:', err);
        setError('Failed to load featured cars');
        setFeaturedCars([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCars();
  }, []);

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#222222' }}>
                Find Your Perfect Car at VehicleSouq
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: '#555555' }}>
                Discover, evaluate, buy and sell cars with confidence using our advanced AI-powered tools and real-time market data.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => handleNavigate('/car-marketplace')}
                  endIcon={<ArrowForward />}
                  sx={{ 
                    borderRadius: '8px', 
                    px: 3, 
                    py: 1, 
                    fontWeight: 600,
                    background: theme.palette.primary.main,
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: theme.palette.primary.dark,
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Browse Cars
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => handleNavigate('/car-listing')}
                  sx={{ 
                    borderRadius: '8px',
                    px: 3, 
                    py: 1, 
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  Sell Your Car
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                component="img"
                src="/modrencar3.png"
                alt="Modern car"
                sx={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Main Services */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <SectionTitle variant="h4" component="h2">
            Our Services
          </SectionTitle>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Comprehensive tools and services to make your car buying and selling experience seamless and informed.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardMedia
                component="img"
                height="180"
                image="/istockphoto.jpg"
                alt="Recognize the Car"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <ImageSearch color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  Car Recognition
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload an image and our AI will identify the make and model instantly.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => handleNavigate('/car-recognizer')}
                  sx={{ mt: 2 }}
                >
                  Try It Now
                </Button>
              </CardContent>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardMedia
                component="img"
                height="180"
                image="/Image8.png"
                alt="Evaluate Car Price"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <AttachMoney color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  Price Evaluation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get accurate market value estimates based on real-time data.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => handleNavigate('/price-prediction')}
                  sx={{ mt: 2 }}
                >
                  Check Price
                </Button>
              </CardContent>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardMedia
                component="img"
                height="180"
                image="/sellurcar.jpg"
                alt="Sell Your Car"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <LocalOffer color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  Sell Your Car
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  List your vehicle with detailed specs and reach potential buyers quickly.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => handleNavigate('/car-listing')}
                  sx={{ mt: 2 }}
                >
                  List Now
                </Button>
              </CardContent>
            </FeatureCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardMedia
                component="img"
                height="180"
                image="/buycar.jpg"
                alt="Buy a Car"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <DirectionsCar color="primary" sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  Buy a Car
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse verified listings and connect directly with sellers.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => handleNavigate('/car-marketplace')}
                  sx={{ mt: 2 }}
                >
                  Find Cars
                </Button>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* Damage Detection Section */}
      <Box sx={{ 
        background: `linear-gradient(to right, #f5f7fa, #e4e8f0)`, // Cool neutral gradient
        py: 6,
        my: 6,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <Box 
                  component="img"
                  src="/damagedCar.png"
                  alt="Car damage detection"
                  sx={{ 
                    width: '100%',
                    display: 'block',
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    paddingX: 2,
                    paddingY: 1,
                    borderRadius: '6px',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  AI POWERED
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h4" component="h2">
                AI Damage Detection
              </SectionTitle>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Our advanced AI technology can detect and analyze car damage from photos, helping you:
              </Typography>
              <Box sx={{ mb: 2 }}>
                { [
                  'Accurately assess vehicle condition',
                  'Generate a detailed damage report',
                  'Verify seller descriptions for transparency'
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CheckCircleOutline sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => handleNavigate('/damage-detect')}
                endIcon={<ArrowForward />}
                sx={{ 
                  mt: 2,
                  borderRadius: '8px',
                  fontWeight: 600,
                  py: 1.2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}
              >
                Try Damage Detection
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Cars Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <SectionTitle variant="h4" component="h2">
            Featured Cars
          </SectionTitle>
          <Button 
            variant="outlined" 
            color="primary"
            endIcon={<ArrowForward />}
            onClick={() => handleNavigate('/car-marketplace')}
          >
            View All Listings
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, textAlign: 'center', my: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <ErrorOutline color="error" sx={{ fontSize: 40, mb: 2 }} />
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : featuredCars.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', my: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No featured cars available at the moment
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {featuredCars.map((car) => (
              <Grid item xs={12} sm={6} md={3} key={car._id}>
                <ListingCard>
                  <CardActionArea onClick={() => handleNavigate(`/car/${car._id}`)}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={car.images && car.images.length > 0 ? `/uploads/${car.images[0]}` : '/default-car.jpg'}
                      alt={car.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                        {car.title}
                      </Typography>
                      
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {Number(car.price).toLocaleString()} EGP
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                        <ListingInfoChip 
                          size="small" 
                          icon={<DirectionsCar />} 
                          label={`${car.year}`} 
                          color={theme.palette.info.main} 
                        />
                        <ListingInfoChip 
                          size="small" 
                          icon={<Speed />} 
                          label={`${Number(car.kilometers).toLocaleString()} km`} 
                          color={theme.palette.warning.main} 
                        />
                        <ListingInfoChip 
                          size="small" 
                          icon={<Settings />} 
                          label={car.transmissionType === 'automatic' ? 'Auto' : 'Manual'} 
                          color={theme.palette.success.main} 
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </ListingCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ mt: 8, mb: 2 }}>
        <Paper sx={{ 
          p: { xs: 3, md: 5 }, 
          textAlign: 'center',
          background: '#2c3e50',  // Dark professional color
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Join VehicleSouq Today
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.95, maxWidth: 700, mx: 'auto', fontSize: '1.1rem' }}>
              Get access to our powerful AI tools and marketplace to make smarter decisions when buying or selling your vehicle.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {!isAuthenticated && (
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => handleNavigate('/signup')}
                  sx={{ 
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#e74c3c',  // Distinct action color
                    color: 'white',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: '#c0392b',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Sign Up Now
                </Button>
              )}
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => handleNavigate('/car-marketplace')}
                sx={{ 
                  borderRadius: '8px',
                  px: 4,
                  py: 1.5,
                  borderColor: '#ffffff',
                  borderWidth: 2,
                  color: '#ffffff',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: alpha('#ffffff', 0.1),
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Browse Cars
              </Button>
              {isAuthenticated && (
                <Button 
                  variant="contained"
                  size="large"
                  onClick={() => handleNavigate('/car-listing')}
                  sx={{ 
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#e74c3c',  // Matching color with sign up
                    color: 'white',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: '#c0392b',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  List Your Car
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;