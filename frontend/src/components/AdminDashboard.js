import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Alert,
  Chip,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

import Scrape from './Scrape';
import DataVisualization from './DataVisualization';

const DashboardHeader = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3, 0),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  },
}));

const SidebarItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: active ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: active ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      sx={{ pt: 2 }}
      {...other}
    >
      {value === index && children}
    </Box>
  );
};

const StatusIndicator = ({ status }) => {
  let color = 'success.main';
  if (status === 'warning') color = 'warning.main';
  if (status === 'error') color = 'error.main';
  
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: color,
        mr: 1
      }}
    />
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    listings: 0,
    sales: 0
  });
  const [statsGrowth, setStatsGrowth] = useState({
    users: { value: '', period: 'this month' },
    cars: { value: '', period: 'new cars' },
    listings: { value: '', period: 'this week' },
    sales: { value: '', period: 'today' }
  });
  const [recentListings, setRecentListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState({ status: 'loading', message: 'Checking connection...' });
  const [apiStatus, setApiStatus] = useState({ status: 'loading', message: 'Checking server status...' });
  
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAccess = () => {
      console.log("Checking admin access:", { isAuthenticated, isAdmin });
      
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate('/login');
        return;
      }

      if (!isAdmin) {
        console.log("Not admin, redirecting to home");
        navigate('/');
        return;
      }
      
      console.log("Admin access verified, showing dashboard");
    };

    checkAccess();
  }, [isAuthenticated, isAdmin, navigate]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      setApiStatus({ status: 'loading', message: 'Fetching data...' });
      setDbStatus({ status: 'loading', message: 'Querying database...' });
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        console.log('Fetching real dashboard data from database...');
        
        // Set a timeout for API requests
        const timeoutDuration = 15000; // 15 seconds
        
        // Function to fetch with timeout
        const fetchWithTimeout = async (url, options) => {
          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutDuration);
            
            const response = await axios.get(url, {
              ...options,
              signal: controller.signal
            });
            
            clearTimeout(id);
            return response;
          } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            // Check if this is a CORS or network error
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
              throw new Error(`Network error - API server may be down or CORS issue: ${error.message}`);
            }
            
            // Check if this is a 405 Method Not Allowed error
            if (error.response && error.response.status === 405) {
              throw new Error(`API method not allowed (405) - Check backend route configuration for ${url}`);
            }
            
            throw error;
          }
        };
        
        // Fetch all data with proper error handling for each request
        let statsResponse = null;
        let listingsResponse = null;
        let usersResponse = null;
        let growthResponse = null;
        
        try {
          console.log('Fetching stats data...');
          // Use the direct endpoint as a fallback
          statsResponse = await fetchWithTimeout('http://localhost:8000/admin/stats-direct', { headers });
          console.log('Stats data received:', statsResponse.data);
          setApiStatus({ status: 'success', message: 'Server online' });
          setDbStatus({ status: 'success', message: 'Connected - Performance normal' });
        } catch (error) {
          console.error('Failed to fetch stats:', error);
          setApiStatus({ status: 'error', message: error.message || 'Server connection issues' });
          setDbStatus({ status: 'warning', message: 'Database connection uncertain' });
        }
        
        try {
          console.log('Fetching listings data...');
          // Use the direct endpoint as a fallback
          listingsResponse = await fetchWithTimeout('http://localhost:8000/admin/listings-direct', { headers });
          console.log('Listings data received:', listingsResponse.data);
        } catch (error) {
          console.error('Failed to fetch listings:', error);
        }
        
        try {
          console.log('Fetching users data...');
          // Use the direct endpoint as a fallback
          usersResponse = await fetchWithTimeout('http://localhost:8000/admin/users-direct', { headers });
          console.log('Users data received:', usersResponse.data);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
        
        try {
          console.log('Fetching growth metrics data...');
          // Use the direct endpoint as a fallback
          growthResponse = await fetchWithTimeout('http://localhost:8000/admin/growth-metrics-direct', { headers });
          console.log('Growth metrics received:', growthResponse.data);
        } catch (error) {
          console.error('Failed to fetch growth metrics:', error);
        }
        
        // Process stats data
        if (statsResponse && statsResponse.data) {
          setStats({
            users: statsResponse.data.total_users || 0,
            cars: statsResponse.data.total_cars || 0,
            listings: statsResponse.data.active_listings || 0,
            sales: statsResponse.data.completed_sales || 0
          });
          console.log('Real stats loaded:', statsResponse.data);
        } else {
          console.warn('Stats API returned empty data');
          setDbStatus({ status: 'warning', message: 'Database connectivity issues' });
        }
        
        // Process listings data
        if (listingsResponse && listingsResponse.data && listingsResponse.data.listings) {
          setRecentListings(listingsResponse.data.listings);
          console.log(`Loaded ${listingsResponse.data.listings.length} real listings`);
        } else {
          console.warn('Listings API returned empty data');
          setRecentListings([]);
        }
        
        // Process users data
        if (usersResponse && usersResponse.data && usersResponse.data.users) {
          setUsers(usersResponse.data.users);
          console.log(`Loaded ${usersResponse.data.users.length} real users`);
        } else {
          console.warn('Users API returned empty data');
          setUsers([]);
        }
        
        // Process growth metrics
        if (growthResponse && growthResponse.data) {
          setStatsGrowth({
            users: { 
              value: growthResponse.data.users_growth || '', 
              period: 'this month' 
            },
            cars: { 
              value: growthResponse.data.cars_growth || '', 
              period: 'new cars' 
            },
            listings: { 
              value: growthResponse.data.listings_growth || '', 
              period: 'this week' 
            },
            sales: { 
              value: growthResponse.data.sales_growth || '', 
              period: 'today' 
            }
          });
          console.log('Real growth metrics loaded:', growthResponse.data);
        } else {
          console.warn('Growth metrics API returned empty data');
        }
        
      } catch (err) {
        console.error("Error fetching real admin dashboard data:", err);
        setError(`Failed to fetch data: ${err.message || 'Unknown error'}. Please check your API server connection.`);
        setApiStatus({ status: 'error', message: 'Server connection failed' });
        setDbStatus({ status: 'error', message: 'Database connection failed' });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, refreshTrigger]);

  const handleLogout = () => {
    logout(() => {
      console.log("Logging out admin and redirecting to home");
      navigate('/');
    });
  };

  const handleSidebarItemClick = (tab) => {
    setSidebarTab(tab);
    
    if (tab === 'dashboard') setActiveTab(0);
    if (tab === 'users') setActiveTab(1);
    if (tab === 'listings') setActiveTab(2);
    if (tab === 'analytics') setActiveTab(3);
    if (tab === 'scraping') setActiveTab(4);
    if (tab === 'settings') setActiveTab(5);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/admin/listings/${listingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Remove from state after successful deletion
        setRecentListings(recentListings.filter(listing => listing._id !== listingId));
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert("Failed to delete listing");
      }
    }
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading Admin Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#f5f7fa', 
      minHeight: '90vh', 
      pt: 3, 
      pb: 6,
      backgroundImage: 'linear-gradient(to bottom, #f8fafc, #f5f7fa)'
    }}>
      <Container maxWidth="xl">
        <DashboardHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center">
              <DashboardIcon 
                fontSize="large" 
                color="primary" 
                sx={{ 
                  mr: 2, 
                  p: 1, 
                  borderRadius: '10px', 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)' 
                }} 
              />
              <Typography variant="h4" fontWeight="bold" color="primary">
                Admin Dashboard
              </Typography>
            </Box>
            
            <Box>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={handleRefreshData} 
                  sx={{ mr: 1 }}
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogout}
                startIcon={<ExitToAppIcon />}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </DashboardHeader>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ErrorIcon sx={{ mr: 1 }} />
            {error}
            <Button 
              size="small" 
              onClick={handleRefreshData} 
              startIcon={<RefreshIcon />}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 3, 
                p: 2, 
                height: '100%',
                background: `linear-gradient(to bottom, ${theme.palette.background.paper}, #fafafa)`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="medium" 
                sx={{ 
                  mb: 2, 
                  pl: 2, 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                Management
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List component="nav">
                <SidebarItem
                  button
                  active={sidebarTab === 'dashboard'}
                  onClick={() => handleSidebarItemClick('dashboard')}
                >
                  <DashboardIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: sidebarTab === 'dashboard' ? 'bold' : 'regular' }} />
                </SidebarItem>
                <SidebarItem
                  button
                  active={sidebarTab === 'users'}
                  onClick={() => handleSidebarItemClick('users')}
                >
                  <PeopleIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Users" primaryTypographyProps={{ fontWeight: sidebarTab === 'users' ? 'bold' : 'regular' }} />
                </SidebarItem>
                <SidebarItem
                  button
                  active={sidebarTab === 'listings'}
                  onClick={() => handleSidebarItemClick('listings')}
                >
                  <DirectionsCarIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Car Listings" primaryTypographyProps={{ fontWeight: sidebarTab === 'listings' ? 'bold' : 'regular' }} />
                </SidebarItem>
                <SidebarItem
                  button
                  active={sidebarTab === 'analytics'}
                  onClick={() => handleSidebarItemClick('analytics')}
                >
                  <DataUsageIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Data Visualization" primaryTypographyProps={{ fontWeight: sidebarTab === 'analytics' ? 'bold' : 'regular' }} />
                </SidebarItem>
                <SidebarItem
                  button
                  active={sidebarTab === 'scraping'}
                  onClick={() => handleSidebarItemClick('scraping')}
                >
                  <CodeIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Data Scraping" primaryTypographyProps={{ fontWeight: sidebarTab === 'scraping' ? 'bold' : 'regular' }} />
                </SidebarItem>
                <SidebarItem
                  button
                  active={sidebarTab === 'settings'}
                  onClick={() => handleSidebarItemClick('settings')}
                >
                  <SettingsIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: sidebarTab === 'settings' ? 'bold' : 'regular' }} />
                </SidebarItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <TabPanel value={activeTab} index={0}>
              <Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <PeopleIcon 
                            color="primary" 
                            sx={{ 
                              backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                              borderRadius: '8px',
                              p: 0.7,
                              mr: 1
                            }}
                          />
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Users
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                          {stats.users > 0 ? stats.users.toLocaleString() : '0'}
                        </Typography>
                        {statsGrowth.users.value ? (
                          <Chip 
                            label={`${statsGrowth.users.value} ${statsGrowth.users.period}`}
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }} 
                          />
                        ) : null}
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <DirectionsCarIcon 
                            color="secondary" 
                            sx={{ 
                              backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                              borderRadius: '8px',
                              p: 0.7,
                              mr: 1
                            }}
                          />
                          <Typography variant="subtitle2" color="text.secondary">
                            Cars in Database
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                          {stats.cars > 0 ? stats.cars.toLocaleString() : '0'}
                        </Typography>
                        {statsGrowth.cars.value ? (
                          <Chip 
                            label={`${statsGrowth.cars.value} ${statsGrowth.cars.period}`}
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }} 
                          />
                        ) : null}
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <DirectionsCarIcon 
                            sx={{ 
                              color: '#2e7d32',
                              backgroundColor: 'rgba(46, 125, 50, 0.1)', 
                              borderRadius: '8px',
                              p: 0.7,
                              mr: 1
                            }}
                          />
                          <Typography variant="subtitle2" color="text.secondary">
                            Active Listings
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                          {stats.listings > 0 ? stats.listings.toLocaleString() : '0'}
                        </Typography>
                        {statsGrowth.listings.value ? (
                          <Chip 
                            label={`${statsGrowth.listings.value} ${statsGrowth.listings.period}`}
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }} 
                          />
                        ) : null}
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <DataUsageIcon 
                            sx={{ 
                              color: '#ed6c02',
                              backgroundColor: 'rgba(237, 108, 2, 0.1)', 
                              borderRadius: '8px',
                              p: 0.7,
                              mr: 1
                            }}
                          />
                          <Typography variant="subtitle2" color="text.secondary">
                            Completed Sales
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                          {stats.sales > 0 ? stats.sales.toLocaleString() : '0'}
                        </Typography>
                        {statsGrowth.sales.value ? (
                          <Chip 
                            label={`${statsGrowth.sales.value} ${statsGrowth.sales.period}`}
                            size="small" 
                            color="success" 
                            sx={{ mt: 1 }} 
                          />
                        ) : null}
                      </CardContent>
                    </StatsCard>
                  </Grid>
                </Grid>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 3, 
                    mb: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    fontWeight="medium" 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center' 
                    }}
                  >
                    <DirectionsCarIcon sx={{ mr: 1 }} />
                    Recent Listings 
                    {recentListings.length === 0 && !loading && (
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ ml: 1, color: 'text.secondary' }}
                      >
                        (No listings available)
                      </Typography>
                    )}
                  </Typography>
                  
                  {recentListings.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Car</TableCell>
                            <TableCell>Price (EGP)</TableCell>
                            <TableCell>Listed By</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentListings.map((listing) => (
                            <TableRow key={listing._id} hover>
                              <TableCell>{listing.title || `${listing.make} ${listing.model}`}</TableCell>
                              <TableCell>{(listing.price || 0).toLocaleString()}</TableCell>
                              <TableCell>{listing.user?.username || 'Unknown'}</TableCell>
                              <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="View">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
                                    sx={{ mx: 0.5 }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small"
                                    onClick={() => navigate(`/admin/edit-listing/${listing._id}`)}
                                    sx={{ mx: 0.5 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteListing(listing._id)}
                                    sx={{ mx: 0.5 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : !loading ? (
                    <Box sx={{ 
                      py: 4, 
                      textAlign: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.01)'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        No listings found in the database
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Add car listings to see them here
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={30} />
                    </Box>
                  )}
                  
                  {recentListings.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleSidebarItemClick('listings')}
                      >
                        View All Listings
                      </Button>
                    </Box>
                  )}
                </Paper>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    fontWeight="medium" 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <DataUsageIcon sx={{ mr: 1 }} />
                    System Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.7)'
                      }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Server Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <StatusIndicator status={apiStatus.status} />
                          <Typography>
                            {apiStatus.message}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.7)'
                      }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Database Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <StatusIndicator status={dbStatus.status} />
                          <Typography>
                            {dbStatus.message}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 3, 
                  p: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="medium" 
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <PeopleIcon sx={{ mr: 1 }} />
                  User Management 
                  {users.length === 0 && !loading && (
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      (No users available)
                    </Typography>
                  )}
                </Typography>
                
                {users.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id} hover>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role || 'User'} 
                                color={user.role === 'admin' ? 'secondary' : 'default'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View">
                                <IconButton size="small" sx={{ mx: 0.5 }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" sx={{ mx: 0.5 }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" sx={{ mx: 0.5 }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : !loading ? (
                  <Box sx={{ 
                    py: 4, 
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.01)'
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      No users found in the database
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={30} />
                  </Box>
                )}
              </Paper>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                  All Car Listings
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Car</TableCell>
                        <TableCell>Price (EGP)</TableCell>
                        <TableCell>Listed By</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentListings.map((listing) => (
                        <TableRow key={listing._id}>
                          <TableCell>{listing.title || `${listing.make} ${listing.model}`}</TableCell>
                          <TableCell>{listing.price.toLocaleString()}</TableCell>
                          <TableCell>{listing.user?.username || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={listing.status || 'Active'} 
                              color={
                                listing.status === 'Sold' ? 'success' : 
                                listing.status === 'Pending' ? 'warning' : 'primary'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              title="View"
                              onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              title="Edit"
                              onClick={() => navigate(`/admin/edit-listing/${listing._id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              title="Delete" 
                              color="error"
                              onClick={() => handleDeleteListing(listing._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" gutterBottom mb={3}>
                  Market Data Visualization
                </Typography>
                <DataVisualization isAdmin={true} />
              </Paper>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" gutterBottom mb={3}>
                  Data Scraping Tools
                </Typography>
                <Scrape isAdmin={true} />
              </Paper>
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                  System Settings
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  System settings functionality will be added in the next update.
                </Alert>
              </Paper>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
