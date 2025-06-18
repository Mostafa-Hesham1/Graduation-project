import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CardActions,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TablePagination,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Person as PersonIcon,
  DirectionsCar,
  DirectionsCar as ListIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ContactMail as ContactMailIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
  BugReport as BugReportIcon,
  ViewCarousel as ViewCarouselIcon,
  QueryBuilder as QueryBuilderIcon,
  ArrowBack,
  ArrowForward,
  CalendarToday,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Create custom styled components to replace Timeline
const CustomTimeline = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  margin: 0,
}));

const CustomTimelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
}));

const CustomTimelineContent = styled(Box)(({ theme }) => ({
  flex: 0.8,
  padding: theme.spacing(0, 1),
}));

const CustomTimelineOppositeContent = styled(Box)(({ theme }) => ({
  flex: 0.2,
  padding: theme.spacing(0, 1),
  textAlign: 'right',
}));

const CustomTimelineSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
}));

const CustomTimelineDot = styled(Box)(({ theme, color = 'primary' }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette[color].main,
}));

const CustomTimelineConnector = styled(Box)(({ theme }) => ({
  width: 2,
  height: 20,
  backgroundColor: theme.palette.divider,
}));

// Styled components
const ProfileContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [listedCars, setListedCars] = useState([]);
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPreferencesOpen, setEditPreferencesOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportImageIndex, setReportImageIndex] = useState(0);
  
  // Form states
  const [editFormData, setEditFormData] = useState({});
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingReports, setLoadingReports] = useState(false);
  const [damageReports, setDamageReports] = useState([]);
  const [damageReportsLoaded, setDamageReportsLoaded] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState(false);
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);
  const [loadingReportButtons, setLoadingReportButtons] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // First get the profile data which includes statistics
      const profileRes = await axios.get('http://localhost:8000/profile/profile', { headers });
      
      // Now fetch listed cars directly from the profile endpoint
      try {
        const listedCarsRes = await axios.get('http://localhost:8000/profile/listed-cars', { headers });
        console.log("Listed cars from profile endpoint:", listedCarsRes.data);
        
        if (listedCarsRes.data && listedCarsRes.data.listed_cars) {
          setListedCars(listedCarsRes.data.listed_cars);
        } else {
          setListedCars([]);
        }
      } catch (err) {
        console.error("Error fetching listed cars:", err);
        setListedCars([]);
      }
      
      // Continue with other requests
      const [favoritesRes, preferencesRes] = await Promise.all([
        axios.get('http://localhost:8000/profile/favorite-cars', { headers }),
        axios.get('http://localhost:8000/profile/preferences', { headers })
      ]);

      setProfile(profileRes.data.profile);
      setStatistics(profileRes.data.statistics);
      setFavoriteCars(favoritesRes.data.favorite_cars);
      setPreferences(preferencesRes.data.preferences);
      setEditFormData(profileRes.data.profile);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:8000/profile/favorite-cars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        setFavoriteCars(response.data.favorite_cars || []);
      }
    } catch (error) {
      console.error('Error fetching favorite cars:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch favorite cars',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimized function to fetch damage reports with caching
  const fetchDamageReports = async (forceRefresh = false) => {
    // Don't refetch if already loaded and not forcing refresh
    if (damageReportsLoaded && !forceRefresh) {
      return;
    }

    try {
      setLoadingReports(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:8000/damage/reports?limit=50&skip=0', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Damage reports response:', response.data);
      
      if (response.data.status === 'success') {
        setDamageReports(response.data.reports || []);
        setDamageReportsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setSnackbar({
        open: true,
        message: error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : 'Failed to fetch damage reports',
        severity: 'error'
      });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('email', editFormData.email);
      formData.append('phone', editFormData.phone || '');

      await axios.put('http://localhost:8000/profile/profile', formData, { headers });
      
      setProfile(editFormData);
      setEditProfileOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const formData = new FormData();
      formData.append('email_notifications', preferences.email_notifications);
      formData.append('sms_notifications', preferences.sms_notifications);
      formData.append('show_phone_number', preferences.show_phone_number);
      formData.append('preferred_contact_method', preferences.preferred_contact_method);

      await axios.put('http://localhost:8000/profile/preferences', formData, { headers });
      
      setEditPreferencesOpen(false);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  // Add a function to handle navigation to edit page
  const handleEditCar = (car) => {
    navigate(`/my-listings`);
  };

  // Add this function to handle removing from favorites
  const handleRemoveFromFavorites = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/profile/favorite-cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the car from the local state
      setFavoriteCars(favoriteCars.filter(car => car.car_id !== carId));
      
      // Update statistics
      setStatistics(prev => ({
        ...prev,
        favorite_cars_count: (prev.favorite_cars_count || 0) - 1
      }));
      
      setSnackbar({
        open: true,
        message: 'Car removed from favorites',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove from favorites',
        severity: 'error'
      });
    }
  };

  // Add a helper function to get the correct image URL
  const getCarImageUrl = (favorite) => {
    // Try different image field names and construct proper URLs
    if (favorite.car_image_url) {
      // If it's already a complete URL, use it
      if (favorite.car_image_url.startsWith('http') || favorite.car_image_url.startsWith('data:')) {
        return favorite.car_image_url;
      }
      // If it's a filename, construct the full URL
      return `http://localhost:8000/uploads/${favorite.car_image_url}`;
    }
    
    if (favorite.image_url) {
      if (favorite.image_url.startsWith('http') || favorite.image_url.startsWith('data:')) {
        return favorite.image_url;
      }
      return `http://localhost:8000/uploads/${favorite.image_url}`;
    }
    
    if (favorite.image) {
      if (favorite.image.startsWith('http') || favorite.image.startsWith('data:')) {
        return favorite.image;
      }
      return `http://localhost:8000/uploads/${favorite.image}`;
    }
    
    // Fallback to a placeholder image
    return 'https://via.placeholder.com/300x200/e0e0e0/666666?text=No+Image';
  };

  // Replace the current handleViewReportDetails function with this enhanced version
  const handleViewReportDetails = async (report) => {
    try {
      console.log('Viewing report details:', report);
      // Set loading state for this specific button
      setLoadingReportButtons(prev => ({ ...prev, [report.report_id]: true }));
      setLoadingReportDetails(true);
      
      // Fetch the complete report with image results
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/damage/report/${report.report_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        // Use the complete report with image results
        setSelectedReport(response.data.report);
        setReportImageIndex(0);
        setReportDialogOpen(true);
      } else {
        throw new Error('Failed to fetch complete report details');
      }
    } catch (error) {
      console.error('Error fetching complete report details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load report details. Please try again.',
        severity: 'error'
      });
    } finally {
      // Clear loading states
      setLoadingReportDetails(false);
      setLoadingReportButtons(prev => ({ ...prev, [report.report_id]: false }));
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (reportId) => {
    setDeleteReportId(reportId);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteReportId(null);
  };

  // Add delete report function
  const handleDeleteReport = async (reportId) => {
    try {
      setDeletingReport(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`http://localhost:8000/damage/report/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        // Remove the report from local state
        setDamageReports(damageReports.filter(report => report.report_id !== reportId));
        
        setSnackbar({
          open: true,
          message: 'Damage report deleted successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting damage report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to delete damage report',
        severity: 'error'
      });
    } finally {
      setDeletingReport(false);
      setDeleteDialogOpen(false);
      setDeleteReportId(null);
    }
  };

  // Modified useEffect for damage reports
  useEffect(() => {
    if (isAuthenticated && tabValue === 4) {
      fetchDamageReports();
    }
  }, [isAuthenticated, tabValue]);

  if (loading) {
    return (
      <ProfileContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <Alert severity="error">{error}</Alert>
      </ProfileContainer>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 5 }, mb: 8, px: { xs: 1, sm: 2 } }}>
      {/* Profile Header - Make responsive */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={12} md={8}>
          <ContentCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 2, sm: 0 }}
              >
                <Box display="flex" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#3b82f6', mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                  <Box textAlign={{ xs: 'center', sm: 'left' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {profile?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.email}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditProfileOpen(true)}
                  size="medium"
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </ContentCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ContentCard>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {profile?.created_date ? new Date(profile.created_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </ContentCard>
        </Grid>
      </Grid>

      {/* Statistics Cards - Improve mobile layout */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
              <ListIcon sx={{ fontSize: { xs: 30, md: 40 }, color: '#3b82f6', mb: 1 }} />
              <Typography variant={{ xs: 'h5', md: 'h3' }} fontWeight="bold" gutterBottom>
                {statistics?.total_listings || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Total Listings
              </Typography>
              {statistics?.active_listings > 0 && (
                <Chip 
                  label={`${statistics.active_listings} Active`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  sx={{ mt: 1, fontSize: { xs: '0.6rem', md: '0.75rem' } }}
                />
              )}
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
              <FavoriteIcon sx={{ fontSize: { xs: 30, md: 40 }, color: '#ef4444', mb: 1 }} />
              <Typography variant={{ xs: 'h5', md: 'h3' }} fontWeight="bold" gutterBottom>
                {statistics?.favorite_cars_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Favorite Cars
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        {/* Removed Total Views and Inquiries cards */}
      </Grid>

      {/* Tabs Section - Fix mobile responsiveness */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-root': {
              minHeight: { xs: 48, md: 64 }
            },
            '& .MuiTab-root': {
              minWidth: { xs: 80, sm: 100, md: 140 },
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
              fontWeight: 500,
              px: { xs: 0.5, sm: 1, md: 2 },
              py: { xs: 1, md: 1.5 },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
              }
            },
            '& .MuiTabs-indicator': {
              height: { xs: 2, md: 3 }
            },
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                opacity: 0.3
              }
            }
          }}
        >
          <Tab 
            icon={<ListIcon />} 
            label="Listings" 
            sx={{ 
              '& .MuiTab-iconWrapper': { 
                mb: { xs: 0.5, md: 1 } 
              } 
            }}
          />
          <Tab 
            icon={<FavoriteIcon />} 
            label="Favorites" 
            sx={{ 
              '& .MuiTab-iconWrapper': { 
                mb: { xs: 0.5, md: 1 } 
              } 
            }}
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Statistics" 
            sx={{ 
              '& .MuiTab-iconWrapper': { 
                mb: { xs: 0.5, md: 1 } 
              } 
            }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Settings" 
            sx={{ 
              '& .MuiTab-iconWrapper': { 
                mb: { xs: 0.5, md: 1 } 
              } 
            }}
          />
          <Tab 
            icon={<BugReportIcon />} 
            label="Reports" 
            sx={{ 
              '& .MuiTab-iconWrapper': { 
                mb: { xs: 0.5, md: 1 } 
              } 
            }}
          />
        </Tabs>

        {/* My Listings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            My Car Listings ({statistics?.total_listings || 0})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (!statistics?.total_listings || statistics.total_listings === 0) ? (
            <Alert severity="info">
              You haven't listed any cars yet. Start by listing your first car!
            </Alert>
          ) : listedCars.length > 0 ? (
            // Mobile-responsive table wrapper
            <Box sx={{ 
              width: '100%', 
              overflowX: 'auto',
              '& .MuiTableContainer-root': {
                minWidth: { xs: 600, md: 'auto' }
              }
            }}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Car Details</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Price</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Status</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listedCars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((car) => (
                      <TableRow key={car.car_id || car._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                              {car.title || `${car.make} ${car.model}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                              {car.make} {car.model} ({car.year})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                            ${car.price?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={car.status || 'Active'}
                            color={car.status === 'Active' ? 'success' : 'default'}
                            size="small"
                            sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Replace menu icon with direct Edit button */}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditCar(car)}
                            sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={listedCars.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  sx={{
                    '& .MuiTablePagination-toolbar': {
                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                    }
                  }}
                />
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="warning">
              Statistics show you have {statistics.total_listings} car listings, but we couldn't load them. Please refresh the page.
            </Alert>
          )}
        </TabPanel>

        {/* Favorite Cars Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            My Favorite Cars ({favoriteCars?.length || 0})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (!favoriteCars || favoriteCars.length === 0) ? (
            <Alert severity="info">
              You haven't added any cars to your favorites yet.
            </Alert>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {favoriteCars.map((favorite) => (
                <Grid item xs={12} sm={6} md={4} key={favorite._id || favorite.favorite_id}>
                  <Card 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={{ xs: 140, md: 160 }}
                      image={getCarImageUrl(favorite)}
                      alt={favorite.car_title || `${favorite.car_make || ''} ${favorite.car_model || ''}`}
                      sx={{ objectFit: "cover" }}
                      onError={(e) => {
                        console.log('Image failed to load, using placeholder');
                        e.target.src = 'https://via.placeholder.com/300x200/e0e0e0/666666?text=No+Image';
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 } }}>
                      <Typography 
                        variant="subtitle1" 
                        component="div" 
                        fontWeight="medium" 
                        gutterBottom 
                        noWrap
                        sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                      >
                        {favorite.car_title || `${favorite.car_make || ''} ${favorite.car_model || ''}`}
                      </Typography>
                      
                      {favorite.car_price && (
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                          EGP {Number(favorite.car_price).toLocaleString()}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {favorite.car_make && (
                          <Chip 
                            label={favorite.car_make} 
                            size="small" 
                            sx={{ 
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), 
                              fontSize: { xs: '0.65rem', md: '0.7rem' } 
                            }} 
                          />
                        )}
                        {favorite.car_model && (
                          <Chip 
                            label={favorite.car_model} 
                            size="small" 
                            sx={{ 
                              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1), 
                              fontSize: { xs: '0.65rem', md: '0.7rem' } 
                            }} 
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ 
                      p: { xs: 1.5, md: 2 }, 
                      pt: 0, 
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/marketplace/car/${favorite.car_id}`)}
                        startIcon={<DirectionsCar />}
                        sx={{ 
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        View Details
                      </Button>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveFromFavorites(favorite.car_id)}
                        size="small"
                        sx={{ 
                          alignSelf: { xs: 'center', sm: 'auto' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Marketplace Statistics
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <TrendingUpIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                      <Typography variant="h6" fontWeight="600" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Listing Performance
                      </Typography>
                    </Box>
                  }
                  sx={{ pb: { xs: 1, md: 2 } }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant={{ xs: 'h5', md: 'h4' }} color="primary" fontWeight="bold">
                          {listedCars?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Active Listings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant={{ xs: 'h5', md: 'h4' }} color="success.main" fontWeight="bold">
                          {statistics?.sold_cars || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Cars Sold
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Account Summary card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <AssessmentIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                      <Typography variant="h6" fontWeight="600" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Account Summary
                      </Typography>
                    </Box>
                  }
                  sx={{ pb: { xs: 1, md: 2 } }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List dense>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary="Total Listings"
                        secondary={statistics?.total_listings || 0}
                        primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary="Favorite Cars"
                        secondary={statistics?.favorite_cars_count || 0}
                        primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemText 
                        primary="Average Views Per Listing"
                        secondary={
                          statistics?.total_listings > 0 
                            ? (statistics.total_views / statistics.total_listings).toFixed(1)
                            : "0"
                        }
                        primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Settings Tab - Remove Marketplace Preferences */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Account Settings
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                No additional settings available at this time.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Damage Reports Tab - Enhanced with delete functionality */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
            >
              My Damage Reports ({damageReports?.length || 0})
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => fetchDamageReports(true)}
              disabled={loadingReports}
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Refresh
            </Button>
          </Box>
          
          {loadingReports ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading damage reports...
              </Typography>
            </Box>
          ) : (!damageReports || damageReports.length === 0) ? (
            <Alert severity="info" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              You haven't created any damage reports yet. Use the "Check Vehicle Damage" feature on any car listing to generate a report.
            </Alert>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {damageReports.map((report) => (
                <Grid item xs={12} sm={6} lg={4} key={report._id || report.report_id}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    boxShadow: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardHeader
                      title={
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="medium" 
                          noWrap
                          sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}
                        >
                          {report.car_title}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <QueryBuilderIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.8rem' } }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                            {new Date(report.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      action={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`${report.total_damages} damages`}
                            color={report.total_damages > 0 ? "error" : "success"}
                            size="small"
                            sx={{ 
                              fontSize: { xs: '0.6rem', md: '0.75rem' },
                              height: { xs: 18, md: 24 }
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(report.report_id)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      sx={{ pb: 0, px: { xs: 1.5, md: 2 }, py: { xs: 1, md: 2 } }}
                    />
                    <Divider sx={{ mx: { xs: 1.5, md: 2 }, my: 0.5 }} />
                    <CardContent sx={{ 
                      pt: 1, 
                      px: { xs: 1.5, md: 2 }, 
                      flexGrow: 1,
                      pb: { xs: 1, md: 2 }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ViewCarouselIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: { xs: '0.9rem', md: '1rem' } }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                            {report.image_results_count || report.total_images || 0} images analyzed
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BugReportIcon 
                            sx={{ 
                              mr: 0.5, 
                              color: report.total_damages > 0 ? 'error.main' : 'success.main',
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            color={report.total_damages > 0 ? 'error.main' : 'success.main'}
                            fontWeight="medium"
                            sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                          >
                            {report.total_damages > 0 
                              ? `${report.total_damages} damages detected` 
                              : "No damage detected"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ 
                      p: { xs: 1.5, md: 2 }, 
                      pt: 0, 
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DirectionsCar />}
                        onClick={() => navigate(`/marketplace/car/${report.car_id}`)}
                        sx={{ 
                          fontSize: { xs: '0.7rem', md: '0.875rem' },
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { sm: '90px' }
                        }}
                        disabled={loadingReportButtons[report.report_id]}
                      >
                        View Car
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={loadingReportButtons[report.report_id] ? 
                          <CircularProgress size={16} color="inherit" /> : 
                          <BugReportIcon />
                        }
                        onClick={() => handleViewReportDetails(report)}
                        disabled={loadingReportButtons[report.report_id]}
                        sx={{ 
                          fontSize: { xs: '0.7rem', md: '0.875rem' },
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { sm: '100px' }
                        }}
                      >
                        {loadingReportButtons[report.report_id] ? 'Loading...' : 'View Report'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

      </Card>

      {/* Delete Report Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1 }} color="error" />
            Delete Damage Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete this damage report? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            All analysis data, images, and results will be permanently removed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deletingReport}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteReport(deleteReportId)} 
            color="error"
            variant="contained"
            disabled={deletingReport}
            startIcon={deletingReport ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deletingReport ? 'Deleting...' : 'Delete Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={editFormData?.name || ''}
            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={editFormData?.email || ''}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            value={editFormData?.phone || ''}
            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Preferences Dialog */}
      {preferences && (
        <Dialog open={editPreferencesOpen} onClose={() => setEditPreferencesOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Marketplace Preferences</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Preferred Contact Method</InputLabel>
              <Select
                value={preferences.preferred_contact_method || 'email'}
                onChange={(e) => setPreferences({...preferences, preferred_contact_method: e.target.value})}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.email_notifications}
                  onChange={(e) => setPreferences({...preferences, email_notifications: e.target.checked})}
                />
              }
              label="Email Notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.show_phone_number}
                  onChange={(e) => setPreferences({...preferences, show_phone_number: e.target.checked})}
                />
              }
              label="Show Phone Number in Listings"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditPreferencesOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePreferences} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Damage Report Dialog - Update to handle loading state */}
      {selectedReport && (
        <Dialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={{ xs: true, md: false }}
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 0, md: 2 },
              maxHeight: { xs: '100vh', md: '90vh' }
            }
          }}
        >
          <DialogTitle sx={{ px: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <BugReportIcon sx={{ mr: 1 }} color="error" />
                Damage Report: {selectedReport?.car_title}
              </Typography>
              <Chip 
                label={`${selectedReport?.total_damages} damages detected`}
                color={selectedReport?.total_damages > 0 ? "error" : "success"}
                variant="outlined"
                size="medium"
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ px: { xs: 1, md: 3 } }}>
            {loadingReportDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Loading report details...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} md={8}>
                  {/* Image viewer with navigation */}
                  <Paper elevation={2} sx={{ p: { xs: 1, md: 2 }, borderRadius: 2, mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Image {reportImageIndex + 1} of {selectedReport?.image_results?.length || 0}
                      </Typography>
                      <Box>
                        <IconButton 
                          disabled={reportImageIndex === 0}
                          onClick={() => setReportImageIndex(prev => prev - 1)}
                          size="medium"
                        >
                          <ArrowBack />
                        </IconButton>
                        <IconButton 
                          disabled={reportImageIndex >= (selectedReport?.image_results?.length || 1) - 1}
                          onClick={() => setReportImageIndex(prev => prev + 1)}
                          size="medium"
                        >
                          <ArrowForward />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', mb: 2 }}>
                      {selectedReport?.image_results?.[reportImageIndex]?.annotated_image ? (
                        <img 
                          src={`data:image/jpeg;base64,${selectedReport.image_results[reportImageIndex].annotated_image}`}
                          alt={`Damage analysis ${reportImageIndex + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            No image available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                      {selectedReport?.image_results?.[reportImageIndex] 
                        ? `${Object.values(selectedReport.image_results[reportImageIndex].damage_counts || {}).reduce((sum, count) => sum + count, 0)} damage instances detected in this image`
                        : "No damage data available"}
                    </Typography>
                  </Paper>
                  
                  {/* Damage instances for current image - Only render if we have data */}
                  {selectedReport?.image_results?.[reportImageIndex] && 
                   Object.values(selectedReport.image_results[reportImageIndex].damage_counts || {}).reduce((sum, count) => sum + count, 0) > 0 && (
                    <Paper elevation={2} sx={{ p: { xs: 1, md: 2 }, borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Detected Damage Areas
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {Object.entries(selectedReport.image_results[reportImageIndex].damage_counts || {}).map(([damageType, count]) => (
                          <Chip 
                            key={damageType}
                            label={`${damageType}: ${count}`}
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                          />
                        ))}
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={{ xs: 1, md: 2 }}>
                        {(selectedReport.image_results[reportImageIndex].damage_crops || []).map((crop, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Card sx={{ height: '100%' }}>
                              <CardMedia
                                component="img"
                                height={{ xs: 80, md: 120 }}
                                image={`data:image/jpeg;base64,${crop.crop}`}
                                alt={`Damage ${index + 1}`}
                              />
                              <CardContent sx={{ py: 1, px: { xs: 1, md: 2 } }}>
                                <Typography variant="caption" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                  {crop.class_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}>
                                  Confidence: {Math.round(crop.confidence * 100)}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  )}
                </Grid>
                
                {/* Summary panel */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: { xs: 2, md: 2 }, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                      Report Summary
                    </Typography>
                    
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <DirectionsCar />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Vehicle"
                          secondary={selectedReport?.car_title}
                          primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Date Created"
                          secondary={selectedReport?.created_at ? new Date(selectedReport.created_at).toLocaleString() : 'N/A'}
                          primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ViewCarouselIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Images Analyzed"
                          secondary={selectedReport?.image_results?.length || 0}
                          primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <BugReportIcon color={selectedReport?.total_damages > 0 ? "error" : "success"} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Total Damages Detected"
                          secondary={selectedReport?.total_damages || 0}
                          primaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                        />
                      </ListItem>
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => navigate(`/marketplace/car/${selectedReport?.car_id}`)}
                      size="medium"
                      sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                    >
                      View Car Listing
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, md: 3 } }}>
            <Button onClick={() => setReportDialogOpen(false)} size="medium">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Profile;