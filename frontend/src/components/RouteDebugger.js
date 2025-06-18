import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// This component will help debug routing issues
const RouteDebugger = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Current location:", location);
    console.log("Available methods on navigate:", Object.keys(navigate));
  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default RouteDebugger;
