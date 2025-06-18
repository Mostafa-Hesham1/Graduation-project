import * as React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Link, 
  Divider, 
  TextField, 
  Button, 
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  YouTube,
  Email, 
  Phone, 
  LocationOn,
  Send
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const FooterContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundImage: 'url(/footer.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#ecf0f1',
  padding: theme.spacing(5, 0, 2), // Increased top padding
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
    backdropFilter: 'blur(5px)',
    zIndex: 1,
  },
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'block',
  color: '#ecf0f1',
  textDecoration: 'none',
  marginBottom: theme.spacing(1),
  transition: 'color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.light,
    transform: 'translateX(5px)',
  }
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: '#ecf0f1',
  transition: 'all 0.3s ease',
  margin: theme.spacing(0, 0.5),
  '&:hover': {
    color: theme.palette.primary.light,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-3px)',
  }
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.light,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: '#ecf0f1',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = React.useState('');
  const { isAuthenticated } = useAuth(); // Get authentication status

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Here you would implement the newsletter subscription logic
    console.log('Subscribing email:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          {/* Company Info & Logo */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                component="img" 
                src="/iconNavbar.png" 
                alt="Vehicle Souq" 
                sx={{ 
                  height: 50, 
                  width: 'auto',
                  mr: 1,
                  filter: 'brightness(1.2)'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                VEHICLE SOUQ
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Your trusted marketplace for buying and selling vehicles with confidence, powered by advanced AI technology.
            </Typography>
            <Box sx={{ display: 'flex', mt: 3 }}>
              <SocialIconButton aria-label="Facebook" size="small">
                <Facebook />
              </SocialIconButton>
              <SocialIconButton aria-label="Twitter" size="small">
                <Twitter />
              </SocialIconButton>
              <SocialIconButton aria-label="Instagram" size="small">
                <Instagram />
              </SocialIconButton>
              <SocialIconButton aria-label="LinkedIn" size="small">
                <LinkedIn />
              </SocialIconButton>
              <SocialIconButton aria-label="YouTube" size="small">
                <YouTube />
              </SocialIconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">
              Quick Links
            </FooterHeading>
            <FooterLink component={RouterLink} to="/">Home</FooterLink>
            <FooterLink component={RouterLink} to="/car-marketplace">Marketplace</FooterLink>
            <FooterLink component={RouterLink} to="/car-recognizer">Car Recognition</FooterLink>
            <FooterLink component={RouterLink} to="/damage-detect">Damage Detection</FooterLink>
            <FooterLink component={RouterLink} to="/price-prediction">Price Prediction</FooterLink>
          </Grid>
          
          {/* User Resources - Conditionally render based on auth status */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">
              User Resources
            </FooterHeading>
            {!isAuthenticated ? (
              // Show these links when user is NOT logged in
              <>
                <FooterLink component={RouterLink} to="/login">Login</FooterLink>
                <FooterLink component={RouterLink} to="/signup">Sign Up</FooterLink>
                <FooterLink component={RouterLink} to="/car-marketplace">Browse Cars</FooterLink>
                <FooterLink component={RouterLink} to="/car-recognizer">Car Recognition</FooterLink>
                <FooterLink component={RouterLink} to="/damage-detect">Damage Detection</FooterLink>
              </>
            ) : (
              // Show these links when user IS logged in
              <>
                <FooterLink component={RouterLink} to="/profile">My Profile</FooterLink>
                <FooterLink component={RouterLink} to="/my-listings">My Listings</FooterLink>
                <FooterLink component={RouterLink} to="/messages">Messages</FooterLink>
                <FooterLink component={RouterLink} to="/car-listing">Sell Your Car</FooterLink>
                <FooterLink component={RouterLink} to="/damage-detect">Damage Detection</FooterLink>
              </>
            )}
          </Grid>
          
          {/* Contact & Newsletter */}
          <Grid item xs={12} md={3}>
            <FooterHeading variant="h6">
              Contact Us
            </FooterHeading>
            <ContactItem>
              <Phone fontSize="small" />
              <Typography variant="body2">+20 100 123 4567</Typography>
            </ContactItem>
            <ContactItem>
              <Email fontSize="small" />
              <Typography variant="body2">info@vehiclesouq.com</Typography>
            </ContactItem>
            <ContactItem>
              <LocationOn fontSize="small" />
              <Typography variant="body2">Cairo, Egypt</Typography>
            </ContactItem>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Subscribe to our newsletter
              </Typography>
              <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex' }}>
                <StyledTextField
                  size="small"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mr: 1 }}
                />
                <Button 
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 'auto' }}
                >
                  <Send fontSize="small" />
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Copyright Section */}
        <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
            &copy; {new Date().getFullYear()} Vehicle Souq. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <FooterLink 
              component={RouterLink} 
              to="/privacy" 
              sx={{ 
                display: 'inline', 
                mb: 0, 
                '&:hover': { transform: 'none', textDecoration: 'underline' } 
              }}
            >
              Privacy Policy
            </FooterLink>
            <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
            <FooterLink 
              component={RouterLink} 
              to="/terms" 
              sx={{ 
                display: 'inline', 
                mb: 0, 
                '&:hover': { transform: 'none', textDecoration: 'underline' } 
              }}
            >
              Terms of Service
            </FooterLink>
            <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
            <FooterLink 
              component={RouterLink} 
              to="/contact" 
              sx={{ 
                display: 'inline', 
                mb: 0, 
                '&:hover': { transform: 'none', textDecoration: 'underline' } 
              }}
            >
              Contact
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
}

export default Footer;