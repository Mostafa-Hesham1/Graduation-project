import React from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const ImageBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& img': {
    width: '100%',
    height: '250px', // Adjusted height for a more compact design
    objectFit: 'cover',
    borderRadius: '10px',
  },
}));

function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button variant="contained" color="primary" sx={{ borderRadius: '20px', padding: '10px 20px', mb: 4 }}>
          Get Started
        </Button>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Welcome to VehicleSouq
        </Typography>
        <Typography variant="h5" component="p" gutterBottom>
          Discover the best way to evaluate, sell, and buy cars with real-time market insights.
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <ImageBox>
            <img src="/Image8.png" alt="Evaluate Your Car Price" />
          </ImageBox>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2', textAlign: 'center' }}>
            Evaluate Your Car Price
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Evaluate your car price with updated real-time prices and more.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <ImageBox>
            <img src="/istockphoto.jpg" alt="Recognize the Car You Want" />
          </ImageBox>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2', textAlign: 'center' }}>
            Recognize the Car You Want
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Recognize the car you want and know its market price.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <ImageBox>
            <img src="/sellurcar.jpg" alt="Sell Your Car" />
          </ImageBox>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2', textAlign: 'center' }}>
            Sell Your Car
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Sell your car with the best price on the market fast.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <ImageBox>
            <img src="/buycar.jpg" alt="Buy a Car" />
          </ImageBox>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2', textAlign: 'center' }}>
            Buy a Car
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Buy a car you want fast and with the best price.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;