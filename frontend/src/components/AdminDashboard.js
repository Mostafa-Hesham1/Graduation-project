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
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Avatar,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
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
import HomeIcon from '@mui/icons-material/Home'; // Add this import for Home icon
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MenuIcon from '@mui/icons-material/Menu';

import Scrape from './Scrape';
import DataVisualization from './DataVisualization';

// Properly styled components with responsive styles
const DashboardHeader = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3, 0),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
  },
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

// Fixed SidebarItem to properly handle the 'active' prop
const SidebarItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: active ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: active ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

const drawerWidth = 240;

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
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
  
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [listingSortBy, setListingSortBy] = useState('newest');

  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Debug logs for authentication and admin status
  useEffect(() => {
    console.log("AdminDashboard - Auth Status:", { isAuthenticated, isAdmin });
    
    // Redirect non-admins to home page
    if (!isAdmin && !loading) {
      console.log("Redirecting non-admin user to home page");
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !isAdmin) {
        console.log("Skipping data fetch - user not authenticated or not admin");
        setLoading(false);
        return;
      }
      
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
        
        const timeoutDuration = 15000; // 15 seconds
        
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
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
              throw new Error(`Network error - API server may be down or CORS issue: ${error.message}`);
            }
            
            if (error.response && error.response.status === 405) {
              throw new Error(`API method not allowed (405) - Check backend route configuration for ${url}`);
            }
            
            throw error;
          }
        };
        
        let statsResponse = null;
        let listingsResponse = null;
        let usersResponse = null;
        let growthResponse = null;
        
        try {
          console.log('Fetching listings data first to calculate stats...');
          listingsResponse = await fetchWithTimeout('http://localhost:8000/cars/listings?limit=50', { headers });
          console.log('Listings data received:', listingsResponse.data);
          setApiStatus({ status: 'success', message: 'Server online' });
          setDbStatus({ status: 'success', message: 'Connected - Performance normal' });
        } catch (error) {
          console.error('Failed to fetch listings:', error);
          setApiStatus({ status: 'error', message: error.message || 'Server connection issues' });
          setDbStatus({ status: 'warning', message: 'Database connection uncertain' });
          
          try {
            listingsResponse = await fetchWithTimeout('http://localhost:8000/admin/listings-direct', { headers });
            console.log('Admin listings data received:', listingsResponse.data);
            setApiStatus({ status: 'success', message: 'Server online' });
            setDbStatus({ status: 'success', message: 'Connected - Performance normal' });
          } catch (listingsError) {
            console.error('Failed to fetch admin listings:', listingsError);
          }
        }
        
        try {
          console.log('Fetching stats data...');
          statsResponse = await fetchWithTimeout('http://localhost:8000/admin/stats-direct', { headers });
          console.log('Stats data received:', statsResponse.data);
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
        
        try {
          console.log('Fetching users data...');
          usersResponse = await fetchWithTimeout('http://localhost:8000/admin/users-direct', { headers });
          console.log('Users data received:', usersResponse.data);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
        
        try {
          console.log('Fetching growth metrics data...');
          growthResponse = await fetchWithTimeout('http://localhost:8000/admin/growth-metrics-direct', { headers });
          console.log('Growth metrics received:', growthResponse.data);
        } catch (error) {
          console.error('Failed to fetch growth metrics:', error);
        }
        
        let listings = [];
        if (listingsResponse && listingsResponse.data) {
          if (listingsResponse.data.listings && Array.isArray(listingsResponse.data.listings)) {
            listings = listingsResponse.data.listings;
          } else if (Array.isArray(listingsResponse.data)) {
            listings = listingsResponse.data;
          } else if (typeof listingsResponse.data === 'object') {
            listings = Object.values(listingsResponse.data).find(arr => Array.isArray(arr)) || [];
          }
          
          const carsCount = listings.length;
          
          setRecentListings(listings.slice(0, 5));
          setAllListings(listings);
          setFilteredListings(listings);
          console.log(`Loaded ${listings.length} real listings`);
          
          setStats(prevStats => ({
            ...prevStats,
            cars: carsCount,
            listings: carsCount
          }));
        } else {
          console.warn('Listings API returned empty data');
          setRecentListings([]);
          setAllListings([]);
          setFilteredListings([]);
        }
        
        if (statsResponse && statsResponse.data) {
          setStats({
            users: statsResponse.data.total_users || 0,
            cars: statsResponse.data.total_cars || listings.length,
            listings: statsResponse.data.active_listings || listings.length,
            sales: statsResponse.data.completed_sales || 0
          });
          console.log('Stats loaded from API:', statsResponse.data);
        } else {
          console.log('Calculating stats from available data...');
          
          const uniqueCars = new Set();
          listings.forEach(listing => {
            if (listing.make && listing.model) {
              uniqueCars.add(`${listing.make}-${listing.model}`);
            }
          });
          
          const userCount = usersResponse?.data?.users?.length || 0;
          
          const salesCount = listings.filter(listing => 
            listing.status && listing.status.toLowerCase() === 'sold'
          ).length;
          
          const carsCount = uniqueCars.size > 0 ? uniqueCars.size : listings.length;
          
          setStats({
            users: userCount,
            cars: carsCount,
            listings: listings.length,
            sales: salesCount
          });
          
          console.log('Stats calculated from data:', { 
            users: userCount,
            cars: carsCount, 
            listings: listings.length,
            sales: salesCount
          });
        }
        
        if (usersResponse && usersResponse.data && usersResponse.data.users) {
          setUsers(usersResponse.data.users);
          
          if (stats.users === 0) {
            setStats(prev => ({
              ...prev,
              users: usersResponse.data.users.length
            }));
          }
          
          console.log(`Loaded ${usersResponse.data.users.length} real users`);
        } else {
          console.warn('Users API returned empty data');
          setUsers([]);
        }
        
        if (growthResponse && growthResponse.data) {
          setStatsGrowth({
            users: { 
              value: growthResponse.data.users_growth || '+5', 
              period: 'this month' 
            },
            cars: { 
              value: growthResponse.data.cars_growth || '+3', 
              period: 'new cars' 
            },
            listings: { 
              value: growthResponse.data.listings_growth || '+7', 
              period: 'this week' 
            },
            sales: { 
              value: growthResponse.data.sales_growth || '+2', 
              period: 'today' 
            }
          });
          console.log('Growth metrics loaded:', growthResponse.data);
        } else {
          console.log('Using default growth metrics');
          setStatsGrowth({
            users: { value: '+5', period: 'this month' },
            cars: { value: '+3', period: 'new cars' },
            listings: { value: '+7', period: 'this week' },
            sales: { value: '+2', period: 'today' }
          });
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

  useEffect(() => {
    let result = [...allListings];
    
    if (listingSearch.trim() !== '') {
      const searchTerm = listingSearch.toLowerCase();
      result = result.filter(listing => 
        (listing.title?.toLowerCase() || '').includes(searchTerm) ||
        (listing.make?.toLowerCase() || '').includes(searchTerm) ||
        (listing.model?.toLowerCase() || '').includes(searchTerm) ||
        (listing.user?.username?.toLowerCase() || '').includes(searchTerm)
      );
    }
    
    if (listingStatusFilter !== 'all') {
      result = result.filter(listing => 
        (listing.status || 'Active').toLowerCase() === listingStatusFilter.toLowerCase()
      );
    }
    
    switch (listingSortBy) {
      case 'newest':
        result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result = result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price-high':
        result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price-low':
        result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      default:
        break;
    }
    
    setFilteredListings(result);
  }, [allListings, listingSearch, listingStatusFilter, listingSortBy]);

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
    
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/admin/listings/${listingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setRecentListings(recentListings.filter(listing => listing._id !== listingId));
        setAllListings(allListings.filter(listing => listing._id !== listingId));
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert("Failed to delete listing");
      }
    }
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatListingFeatures = (listing) => {
    let features = [];
    
    if (listing.mileage) features.push(`${listing.mileage.toLocaleString()} km`);
    if (listing.year) features.push(`${listing.year}`);
    if (listing.color) features.push(listing.color);
    if (listing.transmission) features.push(listing.transmission);
    if (listing.fuel_type) features.push(listing.fuel_type);
    
    return features.join(' • ');
  };
  
  const getStatusColor = (status) => {
    status = (status || 'Active').toLowerCase();
    
    switch (status) {
      case 'sold':
        return 'success';
      case 'pending':
        return 'warning';
      case 'removed':
        return 'error';
      default:
        return 'primary';
    }
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: `linear-gradient(to bottom, ${theme.palette.background.paper}, #fafafa)`,
    }}>
      {isMobile && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <DashboardIcon 
            fontSize="medium" 
            color="primary" 
            sx={{ mr: 1.5 }}
          />
          <Typography variant="h6" color="primary" fontWeight="bold">
            Admin Panel
          </Typography>
        </Box>
      )}
      
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="subtitle1" 
          fontWeight="medium" 
          sx={{ 
            mb: 2, 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
          Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List component="nav" sx={{ p: 0 }}>
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
      </Box>
      
      {isMobile && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            size="medium"
            sx={{ mb: 1 }}
          >
            Back to Home
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            size="small"
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

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
      display: 'flex',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden' // Added overflow hidden to prevent horizontal scrolling
    }}>
      {/* Mobile AppBar - always visible on mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)`, xs: '100%' },
          ml: { sm: `${drawerWidth}px` },
          display: { md: 'none', xs: 'block' }, // Only show on mobile
          backgroundColor: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            Home
          </Button>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefreshData} 
              color="primary"
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar/Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 }
        }}
      >
        {/* Mobile drawer - temporary */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer - permanent */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              position: 'relative',
              height: '100%',
              border: 'none',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)`, xs: '100%' },
          mt: { xs: '56px', sm: '64px', md: 0 }, // Add space below the AppBar on mobile
          overflow: 'auto'
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ mx: 'auto' }}>
          {!isMobile && (
            <DashboardHeader>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={3}>
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
          )}

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

          <TabPanel value={activeTab} index={0}>
            <Box>
              <Grid container spacing={isSmall ? 2 : 3} sx={{ mb: isSmall ? 2 : 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <StatsCard>
                    <CardContent sx={{ p: isSmall ? 1 : 2 }}>
                      <Box display="flex" alignItems="center" mb={isSmall ? 0.5 : 1}>
                        <PeopleIcon 
                          color="primary" 
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                            borderRadius: '8px',
                            p: isSmall ? 0.4 : 0.7,
                            mr: 1,
                            fontSize: isSmall ? '1.2rem' : 'inherit'
                          }}
                        />
                        <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                          Users
                        </Typography>
                      </Box>
                      <Typography variant={isSmall ? "h6" : "h4"} fontWeight="bold" sx={{ mt: isSmall ? 0.5 : 1 }}>
                        {stats.users > 0 ? stats.users.toLocaleString() : '0'}
                      </Typography>
                      {statsGrowth.users.value && !isSmall ? (
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
                <Grid item xs={6} sm={6} md={3}>
                  <StatsCard>
                    <CardContent sx={{ p: isSmall ? 1 : 2 }}>
                      <Box display="flex" alignItems="center" mb={isSmall ? 0.5 : 1}>
                        <DirectionsCarIcon 
                          color="secondary" 
                          sx={{ 
                            backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                            borderRadius: '8px',
                            p: isSmall ? 0.4 : 0.7,
                            mr: 1,
                            fontSize: isSmall ? '1.2rem' : 'inherit'
                          }}
                        />
                        <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                          Cars
                        </Typography>
                      </Box>
                      <Typography variant={isSmall ? "h6" : "h4"} fontWeight="bold" sx={{ mt: isSmall ? 0.5 : 1 }}>
                        {stats.cars > 0 ? stats.cars.toLocaleString() : '0'}
                      </Typography>
                      {statsGrowth.cars.value && !isSmall ? (
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
                <Grid item xs={6} sm={6} md={3}>
                  <StatsCard>
                    <CardContent sx={{ p: isSmall ? 1 : 2 }}>
                      <Box display="flex" alignItems="center" mb={isSmall ? 0.5 : 1}>
                        <DirectionsCarIcon 
                          sx={{ 
                            color: '#2e7d32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)', 
                            borderRadius: '8px',
                            p: isSmall ? 0.4 : 0.7,
                            mr: 1,
                            fontSize: isSmall ? '1.2rem' : 'inherit'
                          }}
                        />
                        <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                          Listings
                        </Typography>
                      </Box>
                      <Typography variant={isSmall ? "h6" : "h4"} fontWeight="bold" sx={{ mt: isSmall ? 0.5 : 1 }}>
                        {stats.listings > 0 ? stats.listings.toLocaleString() : '0'}
                      </Typography>
                      {statsGrowth.listings.value && !isSmall ? (
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
                <Grid item xs={6} sm={6} md={3}>
                  <StatsCard>
                    <CardContent sx={{ p: isSmall ? 1 : 2 }}>
                      <Box display="flex" alignItems="center" mb={isSmall ? 0.5 : 1}>
                        <DataUsageIcon 
                          sx={{ 
                            color: '#ed6c02',
                            backgroundColor: 'rgba(237, 108, 2, 0.1)', 
                            borderRadius: '8px',
                            p: isSmall ? 0.4 : 0.7,
                            mr: 1,
                            fontSize: isSmall ? '1.2rem' : 'inherit'
                          }}
                        />
                        <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                          Sales
                        </Typography>
                      </Box>
                      <Typography variant={isSmall ? "h6" : "h4"} fontWeight="bold" sx={{ mt: isSmall ? 0.5 : 1 }}>
                        {stats.sales > 0 ? stats.sales.toLocaleString() : '0'}
                      </Typography>
                      {statsGrowth.sales.value && !isSmall ? (
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
                  p: { xs: 1.5, sm: 2, md: 3 }, 
                  mb: isSmall ? 2 : 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Typography 
                  variant={isSmall ? "subtitle1" : "h6"} 
                  fontWeight="medium" 
                  sx={{ 
                    mb: isSmall ? 1 : 2,
                    display: 'flex',
                    alignItems: 'center' 
                  }}
                >
                  <DirectionsCarIcon sx={{ mr: 1, fontSize: isSmall ? '1.2rem' : 'inherit' }} />
                  Recent Listings 
                  {recentListings.length === 0 && !loading && (
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      (None)
                    </Typography>
                  )}
                </Typography>
                
                {recentListings.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <TableContainer>
                      <Table size={isSmall ? "small" : "medium"}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Car</TableCell>
                            <TableCell>Price (EGP)</TableCell>
                            <TableCell>Listed By</TableCell>
                            {!isSmall && <TableCell>Date</TableCell>}
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentListings.map((listing) => (
                            <TableRow key={listing._id} hover>
                              <TableCell sx={{ maxWidth: { xs: '120px', sm: '200px' } }}>
                                <Typography noWrap variant="body2">
                                  {listing.title || `${listing.make} ${listing.model}`}
                                </Typography>
                              </TableCell>
                              <TableCell>{(listing.price || 0).toLocaleString()}</TableCell>
                              <TableCell sx={{ maxWidth: { xs: '100px', sm: '150px' } }}>
                                <Typography noWrap variant="body2">
                                  {listing.user?.username || listing.owner_name || 
                                   (listing.owner_id ? "ID: " + listing.owner_id.substring(0, 4) : 'Unknown')}
                                </Typography>
                              </TableCell>
                              {!isSmall && (
                                <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                              )}
                              <TableCell align="right">
                                <Tooltip title="View">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {!isSmall && (
                                  <>
                                    <Tooltip title="Edit">
                                      <IconButton 
                                        size="small"
                                        onClick={() => navigate(`/admin/edit-listing/${listing._id}`)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteListing(listing._id)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : !loading ? (
                  <Box sx={{ 
                    py: isSmall ? 2 : 4, 
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.01)'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: isSmall ? '1rem' : '1.25rem' }} />
                      No listings found in the database
                    </Typography>
                    {!isSmall && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Add car listings to see them here
                      </Typography>
                    )}
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
                      View All
                    </Button>
                  </Box>
                )}
              </Paper>

              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 3, 
                  p: { xs: 1.5, sm: 2, md: 3 },
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Typography 
                  variant={isSmall ? "subtitle1" : "h6"} 
                  fontWeight="medium" 
                  sx={{ 
                    mb: isSmall ? 1 : 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <DataUsageIcon sx={{ mr: 1, fontSize: isSmall ? '1.2rem' : 'inherit' }} />
                  System Status
                </Typography>
                <Grid container spacing={isSmall ? 1 : 2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: isSmall ? 1 : 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}>
                      <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                        Server Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: isSmall ? 0.5 : 1 }}>
                        <StatusIndicator status={apiStatus.status} />
                        <Typography variant={isSmall ? "body2" : "body1"}>
                          {apiStatus.message}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: isSmall ? 1 : 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}>
                      <Typography variant={isSmall ? "caption" : "subtitle2"} color="text.secondary">
                        Database Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: isSmall ? 0.5 : 1 }}>
                        <StatusIndicator status={dbStatus.status} />
                        <Typography variant={isSmall ? "body2" : "body1"}>
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
                p: { xs: 1.5, sm: 2, md: 3 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant={isSmall ? "subtitle1" : "h6"} 
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
                    (None)
                  </Typography>
                )}
              </Typography>
              
              {users.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <TableContainer>
                    <Table size={isSmall ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          {!isSmall && <TableCell>Joined</TableCell>}
                          <TableCell>Role</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id} hover>
                            <TableCell>{user.username}</TableCell>
                            <TableCell sx={{ maxWidth: { xs: '150px', sm: '200px' } }}>
                              <Typography noWrap variant="body2">
                                {user.email}
                              </Typography>
                            </TableCell>
                            {!isSmall && <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>}
                            <TableCell>
                              <Chip 
                                label={user.role || 'User'} 
                                color={user.role === 'admin' ? 'secondary' : 'default'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View">
                                <IconButton size="small">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {!isSmall && (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton size="small">
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error">
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : !loading ? (
                <Box sx={{ 
                  py: 4, 
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.01)'
                }}>
                  <Typography variant="body2" color="text.secondary">
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
            <Paper elevation={2} sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: { xs: 1.5, sm: 2, md: 3 } 
              }}>
                <Typography 
                  variant={isSmall ? "subtitle1" : "h6"} 
                  fontWeight="medium" 
                  sx={{ 
                    mb: { xs: 1, sm: 0 },
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <DirectionsCarIcon sx={{ mr: 1 }} />
                  All Car Listings
                  <Badge 
                    badgeContent={filteredListings.length} 
                    color="primary" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshData}
                >
                  Refresh
                </Button>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Search listings"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={listingStatusFilter}
                      label="Status"
                      onChange={(e) => setListingStatusFilter(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="sold">Sold</MenuItem>
                      <MenuItem value="removed">Removed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={listingSortBy}
                      label="Sort By"
                      onChange={(e) => setListingSortBy(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <SortIcon fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                      <MenuItem value="price-low">Price: Low to High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {filteredListings.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <TableContainer>
                    <Table size={isSmall ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Car Details</TableCell>
                          {!isSmall && <TableCell>Features</TableCell>}
                          <TableCell>Price</TableCell>
                          <TableCell>Listed By</TableCell>
                          {!isSmall && <TableCell>Status</TableCell>}
                          {!isSmall && <TableCell>Date</TableCell>}
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredListings.map((listing) => (
                          <TableRow key={listing._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {listing.images && listing.images.length > 0 ? (
                                  <Avatar 
                                    src={`http://localhost:8000/uploads/${listing.images[0]}`}
                                    variant="rounded" 
                                    sx={{ 
                                      width: isSmall ? 30 : 50, 
                                      height: isSmall ? 30 : 50, 
                                      mr: isSmall ? 1 : 2 
                                    }}
                                  />
                                ) : (
                                  <Avatar 
                                    variant="rounded" 
                                    sx={{ 
                                      width: isSmall ? 30 : 50, 
                                      height: isSmall ? 30 : 50, 
                                      mr: isSmall ? 1 : 2, 
                                      bgcolor: 'primary.light' 
                                    }}
                                  >
                                    <DirectionsCarIcon sx={{ fontSize: isSmall ? 16 : 24 }} />
                                  </Avatar>
                                )}
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" noWrap>
                                    {listing.title || `${listing.make} ${listing.model}`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {listing._id?.substring(0, 6) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            {!isSmall && (
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatListingFeatures(listing) || 'No details available'}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {(listing.price || 0).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {listing.user ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      width: isSmall ? 16 : 24, 
                                      height: isSmall ? 16 : 24, 
                                      mr: 1, 
                                      fontSize: isSmall ? '0.6rem' : '0.8rem' 
                                    }}
                                  >
                                    {listing.user.username?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '80px', sm: '120px' } }}>
                                    {listing.user.username || listing.owner_name || 'Unknown'}
                                  </Typography>
                                </Box>
                              ) : listing.owner_name ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      width: isSmall ? 16 : 24, 
                                      height: isSmall ? 16 : 24, 
                                      mr: 1, 
                                      fontSize: isSmall ? '0.6rem' : '0.8rem' 
                                    }}
                                  >
                                    {listing.owner_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '80px', sm: '120px' } }}>
                                    {listing.owner_name}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">Unknown</Typography>
                              )}
                            </TableCell>
                            {!isSmall && (
                              <TableCell>
                                <Chip 
                                  label={listing.status || 'Active'} 
                                  color={getStatusColor(listing.status)}
                                  size="small" 
                                  variant="outlined"
                                />
                              </TableCell>
                            )}
                            {!isSmall && (
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(listing.created_at).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(listing.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell align="right">
                              <Tooltip title="View Listing">
                                <IconButton 
                                  size="small" 
                                  onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {!isSmall && (
                                <>
                                  <Tooltip title="Edit Listing">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => navigate(`/admin/edit-listing/${listing._id}`)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Listing">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleDeleteListing(listing._id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ 
                  py: isSmall ? 2 : 4, 
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.01)'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {listingSearch || listingStatusFilter !== 'all' ? 
                      'No listings match your search criteria' : 
                      'No car listings found in the database'}
                  </Typography>
                  {(listingSearch || listingStatusFilter !== 'all') && (
                    <Button 
                      variant="text" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setListingSearch('');
                        setListingStatusFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Paper elevation={2} sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant={isSmall ? "subtitle1" : "h6"} gutterBottom mb={isSmall ? 1 : 3}>
                Market Data Visualization
              </Typography>
              <DataVisualization isAdmin={true} />
            </Paper>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Paper elevation={2} sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant={isSmall ? "subtitle1" : "h6"} gutterBottom mb={isSmall ? 1 : 3}>
                Data Scraping Tools
              </Typography>
              <Scrape isAdmin={true} />
            </Paper>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Paper elevation={2} sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight="medium" sx={{ mb: isSmall ? 1 : 3 }}>
                System Settings
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                System settings functionality will be added in the next update.
              </Alert>
            </Paper>
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
