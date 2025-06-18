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
import { NavigateNext, Gavel } from '@mui/icons-material';
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

const TermsOfService = () => {
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
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Gavel sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Terms of Service
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>
      
      <StyledPaper>
        <Typography variant="body1" paragraph>
          Welcome to VehicleSouq. Please read these Terms of Service ("Terms") carefully as they contain important information about your legal rights, remedies and obligations. By accessing or using the VehicleSouq platform, you agree to comply with and be bound by these Terms.
        </Typography>
        
        <SectionTitle variant="h5" component="h2">
          1. Acceptance of Terms
        </SectionTitle>
        <Typography variant="body1" paragraph>
          By accessing or using VehicleSouq, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          2. Account Registration
        </SectionTitle>
        <Typography variant="body1" paragraph>
          To use certain features of our Services, you must register for an account. You must provide accurate, current, and complete information during the registration process and keep your account information up-to-date.
        </Typography>
        <Typography variant="body1" paragraph>
          You are responsible for safeguarding your account credentials and for any activity that occurs under your account. You agree to notify us immediately of any unauthorized access to or use of your username or password.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          3. Listing and Buying Vehicles
        </SectionTitle>
        <Typography variant="body1" paragraph>
          When listing a vehicle on VehicleSouq, you agree to provide accurate and complete information about the vehicle, including its condition, history, and any known defects or issues.
        </Typography>
        <Typography variant="body1" paragraph>
          As a buyer, you are responsible for verifying the accuracy of the listing information and for conducting any necessary inspections or evaluations before completing a purchase.
        </Typography>
        <Typography variant="body1" paragraph>
          VehicleSouq is a platform that connects buyers and sellers and is not responsible for the condition of vehicles, the accuracy of listings, or disputes between users. We do not guarantee the quality, safety, or legality of listed vehicles.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          4. Prohibited Activities
        </SectionTitle>
        <Typography variant="body1" paragraph>
          You agree not to engage in any of the following prohibited activities:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            Violating any applicable laws or regulations
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Posting false, inaccurate, misleading, deceptive, defamatory, or libelous content
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Infringing the intellectual property rights of others
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Distributing viruses, malware, or other malicious code
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Interfering with or disrupting the integrity or performance of the Services
          </Typography>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          5. Limitation of Liability
        </SectionTitle>
        <Typography variant="body1" paragraph>
          To the maximum extent permitted by law, VehicleSouq and its affiliates shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the Services.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          6. Modifications to Terms
        </SectionTitle>
        <Typography variant="body1" paragraph>
          We may modify these Terms from time to time. If we make changes, we will provide notice of such changes, such as by sending an email notification, providing notice through the Services, or updating the date at the top of these Terms. Unless we say otherwise, the amended Terms will be effective immediately, and your continued use of our Services after we provide such notice will confirm your acceptance of the changes.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <SectionTitle variant="h5" component="h2">
          7. Contact Us
        </SectionTitle>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at: <Link href="mailto:info@vehiclesouq.com" color="primary">info@vehiclesouq.com</Link>
        </Typography>
      </StyledPaper>
    </Container>
  );
};

export default TermsOfService;
