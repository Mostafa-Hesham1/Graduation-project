import * as React from 'react';
import { Container, Grid, Typography, Box, Link, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundImage: 'url(/footer.png)', // Restore the footer background image
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#ecf0f1', // Lighter text color
  padding: theme.spacing(2, 0), // Padding for the footer
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional overlay for better contrast
    backdropFilter: 'blur(5px)', // Add blur effect
    zIndex: 1, // Ensure the blur is behind the text
  },
}));

const SocialIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  '& svg': {
    fontSize: '1.5rem', // Slightly smaller icons
    cursor: 'pointer',
    transition: 'color 0.3s',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));

function Footer() {
  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Divider sx={{ mb: 1, bgcolor: '#ecf0f1' }} />
            <Link href="/" color="inherit" underline="hover">
              Home
            </Link>
            <br />
            <Link href="/about" color="inherit" underline="hover">
              About Us
            </Link>
            <br />
            <Link href="/pricing" color="inherit" underline="hover">
              Pricing
            </Link>
            <br />
            <Link href="/contact" color="inherit" underline="hover">
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Divider sx={{ mb: 1, bgcolor: '#ecf0f1' }} />
            <SocialIcon>
              <Link href="https://www.facebook.com" color="inherit" target="_blank" rel="noopener">
                <Facebook />
              </Link>
              <Link href="https://www.twitter.com" color="inherit" target="_blank" rel="noopener">
                <Twitter />
              </Link>
              <Link href="https://www.instagram.com" color="inherit" target="_blank" rel="noopener">
                <Instagram />
              </Link>
            </SocialIcon>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Divider sx={{ mb: 1, bgcolor: '#ecf0f1' }} />
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  );
}

export default Footer; 