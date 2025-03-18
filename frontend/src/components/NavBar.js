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
import AdbIcon from '@mui/icons-material/Adb';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import RouterLink and useNavigate
import { useAuth } from '../context/AuthContext'; // Import your Auth context
import { AccountCircle } from '@mui/icons-material'; // Import AccountCircle icon

// Ensure the pages array includes Damage Detect with the correct path and styling
const pages = [
  { name: 'Home', path: '/' }, 
  { name: 'Car Recognizer', path: '/car-recognizer' },
  { name: 'Damage Detect', path: '/damage-detect', highlight: true },
  { name: 'Price Prediction', path: '/price-prediction' },
  { name: 'Listings', path: '/my-listings', requireAuth: true }
];

// User menu items array
const userMenuItems = [
  { label: 'Profile', action: 'profile' },
  { label: 'My Listings', action: 'myListings' },
  { label: 'Car Listing', action: 'carListing' },
  { label: 'Logout', action: 'logout' }
];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Use context to get authentication state
  const navigate = useNavigate(); // Use useNavigate for navigation

  // Debug authentication state
  console.log("Auth state in NavBar:", isAuthenticated);

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
    setIsAuthenticated(false); // Update sign-in state
    navigate('/'); // Redirect to home or login page
  };

  const handleCarListing = () => {
    if (isAuthenticated) {
      navigate('/car-listing'); // Navigate to car listing page
    } else {
      alert('You must be signed in to list a car.'); // Alert if not signed in
    }
  };

  const handleMyListings = () => {
    console.log("Starting navigation to My Listings");
    handleCloseUserMenu();
    
    // Try window.location.href as a fallback if regular navigation doesn't work
    try {
      console.log("Using navigate('/my-listings')");
      navigate('/my-listings');
    } catch (e) {
      console.error("Navigation failed, using direct href", e);
      window.location.href = "/my-listings";
    }
    console.log("Navigation code complete");
  };

  const handleMenuItemClick = (action) => {
    console.log("Menu item clicked:", action);
    switch(action) {
      case 'myListings':
        handleMyListings();
        break;
      case 'carListing':
        handleCarListing();
        break;
      case 'logout':
        handleSignOut();
        break;
      default:
        handleCloseUserMenu();
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#0f1114' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            <img src="/logo1.png" alt="Logo" style={{ height: '70px', marginRight: '10px' }} />
          </Box>
          
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
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
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu} 
                  component={RouterLink} 
                  to={page.path}
                  sx={{
                    // Add highlight styling for the Damage Detect menu item on mobile
                    ...(page.highlight && {
                      fontWeight: 'bold',
                      bgcolor: '#f0f7ff'
                    })
                  }}
                >
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'center' }}>
            <img src="/logo1.png" alt="Logo" style={{ height: '70px', marginRight: '10px' }} />
          </Box>
                    <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  // Add highlight styling for the Damage Detect button
                  ...(page.highlight && {
                    fontWeight: 'bold',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    }
                  })
                }}
                component={RouterLink} 
                to={page.path}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open user menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {/* Use AccountCircle icon instead of missing image */}
                    <Avatar>
                      <AccountCircle />
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem 
                      key={item.label} 
                      onClick={() => handleMenuItemClick(item.action)}
                      sx={{
                        // Highlight My Listings menu item
                        ...(item.action === 'myListings' && {
                          fontWeight: 'bold',
                          bgcolor: '#f0f7ff'
                        })
                      }}
                    >
                      <Typography sx={{ textAlign: 'center' }}>{item.label}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button onClick={() => navigate('/signup')} sx={{ color: 'white' }}>
                Sign Up
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;