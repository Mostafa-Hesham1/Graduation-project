import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import GoogleIcon from '@mui/icons-material/Google';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';

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
    maxWidth: '480px',
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
  // Add animation using CSS instead of framer-motion
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props) {
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateInputs()) {
      return;
    }
    
    const data = new FormData(event.currentTarget);
    const user = {
      username: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
      phone: data.get('phone'),
    };
    
    try {
      await registerUser(user);
      setSignupSuccess(true);
      setMessage('Signup successful! Redirecting to login...');
      
      // Redirect after successful registration with a slight delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      setMessage('Registration failed: ' + (error.message || 'Please try again'));
    }
  };

  const validateInputs = () => {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const phone = document.getElementById('phone');

    let isValid = true;

    // Validate name
    if (!name.value) {
      setNameError(true);
      setNameErrorMessage('Please enter your name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    // Validate email
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!password.value || !passwordRegex.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    // Validate phone
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phone.value || !phoneRegex.test(phone.value)) {
      setPhoneError(true);
      setPhoneErrorMessage('Please enter a valid Egyptian phone number.');
      isValid = false;
    } else {
      setPhoneError(false);
      setPhoneErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column">
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
                Create an Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Join Vehicle Souq to access all features
              </Typography>
            </Box>

            {signupSuccess ? (
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
                width: '100%',
                gap: 2,
              }}
            >
              <FormControl>
                <StyledTextField
                  error={nameError}
                  helperText={nameErrorMessage}
                  id="name"
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="Your Name"
                  autoComplete="name"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={nameError ? 'error' : 'primary'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color={nameError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              
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
                  autoComplete="new-password"
                  required
                  fullWidth
                  variant="outlined"
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
              
              <FormControl>
                <StyledTextField
                  error={phoneError}
                  helperText={phoneErrorMessage}
                  id="phone"
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="01xxxxxxxxx"
                  autoComplete="tel"
                  required
                  fullWidth
                  variant="outlined"
                  color={phoneError ? 'error' : 'primary'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color={phoneError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              
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
                label={
                  <Typography variant="body2">
                    I agree to the <Link href="#" underline="hover" sx={{ fontWeight: 'bold' }}>Terms of Service</Link> and <Link href="#" underline="hover" sx={{ fontWeight: 'bold' }}>Privacy Policy</Link>
                  </Typography>
                }
              />
              
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={validateInputs}
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #324090, #1e88e5)',
                  }
                }}
              >
                Create Account
              </StyledButton>
            </Box>
            
            <StyledDivider>or continue with</StyledDivider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <StyledButton
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<GoogleIcon />}
                onClick={() => alert('Sign up with Google')}
              >
                Google
              </StyledButton>
              
              <Typography sx={{ textAlign: 'center', mt: 2 }}>
                Already have an account?{' '}
                <Link
                  href="/login"
                  underline="hover"
                  sx={{ fontWeight: 'bold', color: '#3f51b5' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Card>
        </Fade>
      </SignUpContainer>
    </AppTheme>
  );
}