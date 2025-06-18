import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 5),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const PrivacyPolicy = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link component={RouterLink} to="/" color="inherit">Home</Link>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Lock sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Privacy Policy
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>
      
      <StyledPaper>
        <Typography variant="body1" paragraph>
          At VehicleSouq, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share information about you when you use our website, mobile applications, and other online products and services (collectively, the "Services").
        </Typography>
        
        <SectionTitle variant="h5" component="h2">
          Information We Collect
        </SectionTitle>
        <Typography variant="body1" paragraph>
          We collect information you provide directly to us when you register for an account, create or modify your profile, set preferences, sign-up for or make purchases through the Services. This information may include your name, email address, phone number, postal address, profile picture, and other information you choose to provide.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          How We Use Your Information
        </SectionTitle>
        <Typography variant="body1" paragraph>
          We use the information we collect to provide, maintain, and improve our Services, such as to administer your account, deliver the products and services you request, process transactions, and send you related information including confirmations and invoices.
        </Typography>
        <Typography variant="body1" paragraph>
          We may also use the information to:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            Send you technical notices, updates, security alerts, and support and administrative messages
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Respond to your comments, questions, and requests and provide customer service
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Communicate with you about products, services, offers, promotions, and events, and provide other news or information about VehicleSouq
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Process and deliver contest entries and rewards
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          Sharing of Information
        </SectionTitle>
        <Typography variant="body1" paragraph>
          We may share the information we collect as follows:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of VehicleSouq or others
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          Your Choices
        </SectionTitle>
        <Typography variant="body1" paragraph>
          You can access and update certain information about you from within your account settings. If you have any questions about viewing or updating your information, please contact us.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          Contact Us
        </SectionTitle>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at: <Link href="mailto:info@vehiclesouq.com" color="primary">info@vehiclesouq.com</Link>
        </Typography>
      </StyledPaper>
    </Container>
  );
};

export default PrivacyPolicy;
