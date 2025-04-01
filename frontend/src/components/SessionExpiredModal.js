import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  LinearProgress,
  Typography,
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockClock } from '@mui/icons-material';

const SessionExpiredModal = ({ open, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds countdown
  const navigate = useNavigate();

  // Check if the user is on the login or signup page already
  const isOnAuthPage = window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/signup');

  // Reset timer when modal opens
  useEffect(() => {
    if (open) {
      setTimeLeft(5);
    }
  }, [open]);

  useEffect(() => {
    // Don't show the modal or start countdown if already on an auth page
    if (!open || isOnAuthPage) return;

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, navigate, isOnAuthPage]);

  // Progress calculation
  const progress = ((5 - timeLeft) / 5) * 100;

  // Don't render the modal if already on auth pages
  if (isOnAuthPage) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          p: 1
        }
      }}
    >
      <DialogTitle id="session-expired-title" sx={{ display: 'flex', alignItems: 'center' }}>
        <LockClock sx={{ mr: 1, color: 'warning.main' }} />
        Session Expired
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="session-expired-description">
          Your session has expired due to inactivity. You will be redirected to the login page in {timeLeft} seconds.
        </DialogContentText>
        
        <Box sx={{ width: '100%', mt: 3 }}>
          <LinearProgress variant="determinate" value={progress} color="warning" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Redirecting...
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => navigate('/login')} color="primary" variant="contained">
          Log in now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredModal;
