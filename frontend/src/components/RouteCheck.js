import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Paper } from '@mui/material';

const RouteCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Current location:", location);
  }, [location]);
  
  const testRoutes = [
    '/',
    '/car-recognizer',
    '/my-listings',
    '/test'
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3, m: 3 }}>
      <Typography variant="h5" gutterBottom>Route Checker</Typography>
      <Typography variant="body1">Current path: {location.pathname}</Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Test navigation to:</Typography>
        {testRoutes.map(route => (
          <Button
            key={route}
            variant="outlined"
            sx={{ m: 1 }}
            onClick={() => {
              console.log(`Testing navigation to ${route}`);
              navigate(route);
            }}
          >
            {route}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default RouteCheck;
