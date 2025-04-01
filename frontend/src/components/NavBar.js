import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled, alpha } from '@mui/material/styles';
import { 
  AccountCircle, 
  DirectionsCar, 
  LocalOffer,
  Dashboard,
  PhotoCamera,
  Build,
  AttachMoney,
  Person,
  Email as EmailIcon
} from '@mui/icons-material';
import { Divider, useMediaQuery, useTheme } from '@mui/material';
import MessageIcon from './MessageIcon'; // Import the MessageIcon component

// Define the base color scheme
const NAVBAR_BG = 'rgb(41,41,41)';
const NAVBAR_BORDER = 'rgba(90,90,90,0.2)';
const ACCENT_COLOR = '#3f51b5';
const ACCENT_GRADIENT = 'linear-gradient(45deg, #3f51b5, #2196f3)';
const ADMIN_GRADIENT = 'linear-gradient(45deg, #f44336, #ff9800)';

// Define styled components with a more streamlined design
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: NAVBAR_BG,
  boxShadow: `0 1px 8px rgba(0,0,0,0.2)`,
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: `1px solid ${NAVBAR_BORDER}`,
  height: '64px', // Fixed height for more compact appearance
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const StyledButton = styled(Button)(({ theme, active }) => ({
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  color: 'white',
  fontWeight: active ? 600 : 400,
  fontSize: '0.9rem',
  padding: theme.spacing(0.7, 1.5),
  position: 'relative',
  overflow: 'hidden',
  minWidth: 'auto',
  textTransform: 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem', // Increased icon size
    marginRight: theme.spacing(0.8),
  },
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: ACCENT_GRADIENT,
  } : {},
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '2px',
      background: ACCENT_GRADIENT,
    },
  },
}));

const AdminButton = styled(Button)(({ theme }) => ({
  background: ADMIN_GRADIENT,
  color: 'white',
  fontWeight: 500,
  fontSize: '0.9rem',
  padding: theme.spacing(0.7, 1.5),
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  borderRadius: '4px',
  minWidth: 'auto',
  textTransform: 'none',
  boxShadow: 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem', // Increased icon size
    marginRight: theme.spacing(0.8),
  },
  '&:hover': {
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
  },
}));

const CustomizedMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgb(35,35,35)',
    color: 'white',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${NAVBAR_BORDER}`,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme, isHighlighted, isAdmin }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  color: isHighlighted ? ACCENT_COLOR : 'white',
  fontWeight: isHighlighted ? 500 : 400,
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem', // Increased icon size in menu
  },
  backgroundColor: isHighlighted 
    ? alpha(ACCENT_COLOR, 0.1)
    : isAdmin
      ? alpha('#f44336', 0.1)
      : 'transparent',
  '&:hover': {
    backgroundColor: isHighlighted
      ? alpha(ACCENT_COLOR, 0.15)
      : isAdmin
        ? alpha('#f44336', 0.15)
        : 'rgba(255, 255, 255, 0.05)',
  },
}));

// Define the pages array with icons - without "My Listings" as requested
const pages = [
  { name: 'Home', path: '/', icon: <DirectionsCar /> }, 
  { name: 'Marketplace', path: '/car-marketplace', icon: <LocalOffer /> }, // Fixed path to match correct route
  { name: 'Car Recognizer', path: '/car-recognizer', icon: <PhotoCamera /> },
  { name: 'Damage Detect', path: '/damage-detect', icon: <Build /> },
  { name: 'Price Prediction', path: '/price-prediction', icon: <AttachMoney /> },
  { name: 'Admin', path: '/admin-dashboard', requireAdmin: true, icon: <Dashboard /> }
];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log("NavBar - Current isAdmin status:", isAdmin); // Debug log to verify isAdmin value

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Auth state management
  React.useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if ((token && !isAuthenticated) || (!token && isAuthenticated)) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Only check token status on mount once and if the component is fully mounted
    // This prevents refresh loops
    let isMounted = true;
    if (isMounted) {
      const token = localStorage.getItem('token');
      const tokenExists = !!token;
      if (tokenExists !== isAuthenticated) {
        console.log("Auth state mismatch detected, handling without refresh");
        // Instead of refreshing, we could trigger a state update in the context
        // but we should not reload the page which causes refresh loops
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = () => {
    handleCloseUserMenu();
    logout(() => navigate('/'));
  };

  const handleMenuItemClick = (action) => {
    switch(action) {
      case 'dashboard':
        navigate('/admin-dashboard');
        break;
      case 'myListings':
        navigate('/my-listings');
        break;
      case 'carListing':
        navigate('/car-listing');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'logout':
        handleSignOut();
        break;
      default:
        break;
    }
    handleCloseUserMenu();
  };

  // User menu items with icons - added Messages menu item
  const userMenuItems = [
    ...(isAdmin ? [{ label: 'Admin Dashboard', action: 'dashboard', icon: <Dashboard color="error" /> }] : []),
    { label: 'My Profile', action: 'profile', icon: <Person color="primary" /> },
    { label: 'My Listings', action: 'myListings', icon: <LocalOffer color="primary" /> },
    { label: 'Messages', action: 'messages', icon: <EmailIcon color="primary" /> },
    { label: 'List Your Car', action: 'carListing', icon: <DirectionsCar color="primary" /> },
    { label: 'Logout', action: 'logout', icon: <AccountCircle /> }
  ];

  return (
    <StyledAppBar position="static">
      <Container maxWidth="xl" sx={{ pl: { xs: 1, md: 2 }, pr: { xs: 1, md: 2 } }}> {/* Reduced padding for better logo alignment */}
        <Toolbar disableGutters sx={{ minHeight: '64px', height: '64px', py: 0 }}>
          {/* Logo for desktop - Optimized size and placement */}
          <LogoContainer 
            sx={{ display: { xs: 'none', md: 'flex' }, mr: 1.5 }}
            component={RouterLink} 
            to="/"
          >
            <img src="/iconNavbar.png" alt="Vehicle Souq Logo" style={{ height: '70px', width: '80px' }} />
          </LogoContainer>
          
          {/* Brand name for desktop - adjusted for perfect size */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem', // Slightly smaller to fit perfectly
              letterSpacing: '.02rem', // Adjusted for better spacing
              color: 'white',
              textDecoration: 'none',
            }}
          >
            VEHICLE SOUQ
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <IconButton
              size="medium"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: 'white' }}
            >
              <MenuIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
            <CustomizedMenu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => {
                // Skip admin-only pages if user is not admin
                if (page.requireAdmin && !isAdmin) return null;
                
                const isActive = isActivePath(page.path);
                
                return (
                  <StyledMenuItem 
                    key={page.name} 
                    onClick={handleCloseNavMenu}
                    component={RouterLink}
                    to={page.path}
                    isHighlighted={isActive}
                    isAdmin={page.requireAdmin}
                  >
                    {React.cloneElement(page.icon, { fontSize: 'medium' })}
                    <Typography variant="body2">
                      {page.name}
                    </Typography>
                  </StyledMenuItem>
                );
              })}
            </CustomizedMenu>
          </Box>
          
          {/* Mobile logo - adjusted size and uses the same logo as desktop */}
          <LogoContainer 
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'center' }}
            component={RouterLink}
            to="/"
          >
            <img src="/iconNavbar.png" alt="Vehicle Souq Logo" style={{ height: '60px', width: '70px' }} />
          </LogoContainer>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 0 }}>
            {pages.map((page) => {
              // Skip admin-only pages if user is not admin
              if (page.requireAdmin && !isAdmin) {
                console.log(`Skipping admin page "${page.name}" because isAdmin is:`, isAdmin);
                return null;
              }
              
              const isActive = isActivePath(page.path);
              
              // For admin pages, render with the AdminButton style
              if (page.requireAdmin) {
                console.log(`Rendering admin button for "${page.name}"`);
                return (
                  <AdminButton
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    startIcon={page.icon}
                  >
                    {page.name}
                  </AdminButton>
                );
              }
              
              // For regular pages, render with the standard StyledButton
              return (
                <StyledButton
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  startIcon={page.icon}
                  active={isActive ? 1 : 0}
                >
                  {page.name}
                </StyledButton>
              );
            })}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {/* Add MessageIcon component here */}
                <MessageIcon />
                
                <Tooltip title={user?.username || 'User Menu'}>
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0.7,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: isAdmin ? alpha('#f44336', 0.8) : alpha('#3f51b5', 0.8), // Lighter background color
                        width: 42, 
                        height: 42, 
                        fontSize: '1.4rem',
                      }}
                    >
                      {user?.username ? user.username[0].toUpperCase() : <AccountCircle sx={{ fontSize: '1.8rem' }} />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <CustomizedMenu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                      {user?.username || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      {user?.email}
                    </Typography>
                    {isAdmin && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontWeight: 'bold' }}>
                        Admin
                      </Typography>
                    )}
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }} />
                  
                  {userMenuItems.map((item) => {
                    const isActive = location.pathname === (item.action === 'myListings' ? '/my-listings' : 
                                                           item.action === 'dashboard' ? '/admin-dashboard' : 
                                                           item.action === 'profile' ? '/profile' : 
                                                           item.action === 'messages' ? '/messages' : '');
                    
                    return (
                      <StyledMenuItem 
                        key={item.label} 
                        onClick={() => handleMenuItemClick(item.action)}
                        isHighlighted={isActive} // Only highlight if it's the active path
                        isAdmin={item.action === 'dashboard'}
                      >
                        {item.icon}
                        <Typography variant="body2">{item.label}</Typography>
                      </StyledMenuItem>
                    );
                  })}
                </CustomizedMenu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={RouterLink}
                  to="/login"
                  size="small"
                  sx={{ 
                    color: 'white',
                    fontSize: '0.85rem',
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  component={RouterLink}
                  to="/signup"
                  size="small"
                  sx={{ 
                    background: ACCENT_GRADIENT,
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    px: 1.5,
                    py: 0.5,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 2px 6px rgba(33, 150, 243, 0.3)',
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
}

export default ResponsiveAppBar;