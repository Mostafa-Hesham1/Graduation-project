import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import AppTheme from '../shared-theme/AppTheme';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';

// Styled components with enhanced design
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  padding: theme.spacing(5),
  gap: theme.spacing(2),
  margin: 'auto',
  border: 'none',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
    height: 'auto',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
  },
  // Add animation using CSS
  animation: 'fadeInUp 0.5s ease-out',
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'fixed',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'url(/signup car logo.png), linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: 'overlay',
    opacity: 0.9,
    ...theme.applyStyles('dark', {
      backgroundImage: 'url(/signup car logo.png), linear-gradient(135deg, #1c2331 0%, #111827 100%)',
      opacity: 0.8,
    }),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '8px',
  padding: '12px 16px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: variant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 6px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
}));

export default function Login(props) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const { setUser, setIsAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    let isValid = true;
    
    // Email validation - only check if it's not empty
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }
    
    // Password validation - only check if it's not empty
    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('Password is required.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;
    
    setLoginSuccess(false);
    setMessage('');
    
    // Debug logging
    console.log('Login attempt with:', { emailLength: email.length, passwordLength: password.length });
    
    try {
      // Call the API with a clear try/catch
      const response = await loginUser({ email, password });
      
      // Check response format
      console.log('Login response type:', typeof response);
      console.log('Login success, received token:', !!response.access_token);
      
      if (response && response.access_token) {
        setLoginSuccess(true);
        setMessage('Login successful! Redirecting...');
        
        // Store user data
        const userData = {
          id: response.user_id,
          username: response.username,
          email: response.email,
          role: response.role || 'user' // Default to user role if none provided
        };
        
        // Login using context
        login(userData, response.access_token);
        
        // Redirect after delay
        setTimeout(() => {
          if (userData.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        throw new Error('Invalid response format - missing token');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`Login failed: ${error.message}`);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline />
      <LoginContainer direction="column" justifyContent="center">
        <Fade in={true} timeout={500}>
          <Card variant="outlined">
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img src="/signupCarLogo.png" alt="Vehicle Souq Logo" height="60" />
              <Typography
                component="h1"
                variant="h4"
                sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  mt: 2
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Login to access your Vehicle Souq account
              </Typography>
            </Box>

            {loginSuccess ? (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {message}
              </Alert>
            ) : message && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {message}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <FormControl>
                <StyledTextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="email"
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  fullWidth
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  color={emailError ? 'error' : 'primary'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={emailError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <FormControl>
                <StyledTextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  color={passwordError ? 'error' : 'primary'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color={passwordError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      value="remember" 
                      color="primary" 
                      sx={{ 
                        '&.Mui-checked': { 
                          color: '#3f51b5' 
                        } 
                      }}
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link 
                  component="button" 
                  onClick={handleClickOpen} 
                  variant="body2" 
                  underline="hover"
                  sx={{ fontWeight: 'medium', color: '#3f51b5' }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <StyledButton 
                type="submit" 
                fullWidth 
                variant="contained" 
                size="large"
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #324090, #1e88e5)',
                  }
                }}
              >
                Sign In
              </StyledButton>
            </Box>

            <ForgotPassword open={open} handleClose={handleClose} />
            
            <StyledDivider>or continue with</StyledDivider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <StyledButton
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<GoogleIcon />}
              >
                Google
              </StyledButton>
              
              <Typography sx={{ textAlign: 'center', mt: 2 }}>
                Don't have an account?{' '}
                <Link
                  onClick={() => navigate('/signup')}
                  href="#"
                  underline="hover"
                  sx={{ fontWeight: 'bold', color: '#3f51b5', cursor: 'pointer' }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Card>
        </Fade>
      </LoginContainer>
    </AppTheme>
  );
}
