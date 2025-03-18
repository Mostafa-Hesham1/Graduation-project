import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Container,
  Chip,
  styled,
  alpha,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItem,
  List,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '25vh',
  backgroundImage: 'url(/damage-bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  padding: 0,
  margin: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  borderRadius: '0px 0px 20px 20px',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  }
}));

const StyledUploadButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(1.5, 4),
  borderRadius: 8,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
    transform: 'scale(1.05)',
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  border: '3px solid rgba(255, 0, 0, 0.7)',
  borderRadius: 8,
  overflow: 'hidden',
  width: '100%',
  maxWidth: 600,
  height: 400,
  margin: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  position: 'relative',
}));

const DamageChip = styled(Chip)(({ theme, damageType }) => {
  const colorMap = {
    'Front-Windscreen-Damage': '#FF5252',
    'Headlight-Damage': '#FF9800',
    'Rear-windscreen-Damage': '#FF5252',
    'RunningBoard-Dent': '#8D6E63',
    'Sidemirror-Damage': '#78909C',
    'Signlight-Damage': '#FFC107',
    'Taillight-Damage': '#F44336',
    'Bonnet-Dent': '#E91E63',
    'Doorouter-Dent': '#7B1FA2',
    'Fender-Dent': '#5D4037',
    'Front-Bumper-Dent': '#D32F2F',
    'Pillar-Dent': '#455A64',
    'Quaterpanel-Dent': '#512DA8',
    'Rear-Bumper-Dent': '#C2185B',
    'Roof-Dent': '#303F9F',
  };
  const color = colorMap[damageType] || theme.palette.error.main;
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    borderColor: color,
    fontWeight: 'bold',
    margin: theme.spacing(0.5),
    '& .MuiBadge-badge': {
      backgroundColor: color,
    }
  };
});

const DamageSummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'visible',
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #f44336, #ff9800)',
    borderTopLeftRadius: theme.spacing(2),
    borderTopRightRadius: theme.spacing(2),
  }
}));

const DamageDetect = () => {
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [damageCrops, setDamageCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detections, setDetections] = useState([]);
  const [damageCounts, setDamageCounts] = useState({});
  const [totalDamage, setTotalDamage] = useState(0);

  // Format the damage type name for better display
  const formatDamageType = (damageType) => {
    return damageType
      .replace(/-/g, ' ')
      .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnnotatedImage(null);
      setDamageCrops([]);
      setDetections([]);
      setDamageCounts({});
      setTotalDamage(0);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', image);
      const response = await axios.post(
        'http://localhost:8000/damage/detect',
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );
      if (response.data) {
        setAnnotatedImage(`data:image/jpeg;base64,${response.data.annotated_image}`);
        setDetections(response.data.detections || []);
        setDamageCounts(response.data.damage_counts || {});
        setDamageCrops(response.data.damage_crops || []);
        const total = Object.values(response.data.damage_counts || {}).reduce(
          (sum, count) => sum + count, 0
        );
        setTotalDamage(total);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error('Error detecting damage:', err);
      setError(err.response?.data?.detail || err.message || "Failed to detect damage");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <HeroSection>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Car Damage Detection
          </Typography>
          <Typography variant="body1">
            Upload a photo to automatically detect and assess vehicle damage
          </Typography>
        </Box>
      </HeroSection>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Upload Vehicle Image
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please upload a clear image of the damaged vehicle. For best results, ensure good lighting and that the damage is clearly visible.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <StyledUploadButton component="label" startIcon={<UploadFileIcon />}>
                  Upload Image
                  <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </StyledUploadButton>
              </Box>

              {previewImage && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      pt: '56.25%',  
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img 
                      src={previewImage} 
                      alt="Car Preview" 
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  disabled={!image || isLoading}
                  onClick={handleDetect}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Damage'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {isLoading ? (
                <Paper 
                  elevation={3}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    borderRadius: 2
                  }}
                >
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography>
                    Analyzing damage... Please wait.
                  </Typography>
                </Paper>
              ) : error ? (
                <Alert 
                  severity="error" 
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <ErrorIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">{error}</Typography>
                </Alert>
              ) : annotatedImage ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    Damage Detection Results
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      width: '100%', 
                      pt: '56.25%',  
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                      mb: 2
                    }}
                  >
                    <img 
                      src={annotatedImage} 
                      alt="Damage Analysis" 
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                  </Box>
                  
                  <DamageSummaryCard sx={{ mt: 2, flexGrow: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WarningIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {totalDamage > 0 
                            ? `Detected ${totalDamage} damage point${totalDamage > 1 ? 's' : ''}`
                            : 'No damage detected'}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      {totalDamage > 0 ? (
                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="medium">Damage Summary</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List disablePadding>
                              {Object.entries(damageCounts).map(([damageType, count]) => (
                                <ListItem 
                                  key={damageType}
                                  disablePadding
                                  sx={{ mb: 1 }}
                                >
                                  <Badge badgeContent={count} color="error" sx={{ width: '100%' }}>
                                    <DamageChip 
                                      label={formatDamageType(damageType)}
                                      variant="outlined"
                                      damageType={damageType}
                                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                                    />
                                  </Badge>
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography>No damage detected in this image</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </DamageSummaryCard>
                </Box>
              ) : (
                <Paper 
                  elevation={1}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    borderRadius: 2,
                    border: '2px dashed #e0e0e0',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Typography variant="body1" color="text.secondary" align="center">
                    Upload and analyze an image to see damage detection results here
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Additional section to display cropped damage areas */}
        {damageCrops.length > 0 && (
          <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detected Damage Areas
            </Typography>
            <Grid container spacing={2}>
              {damageCrops.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={`data:image/jpeg;base64,${item.crop}`}
                        alt={formatDamageType(item.class_name)}
                        style={{ width: '100%', borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="subtitle1">
                      {formatDamageType(item.class_name)}
                    </Typography>
                    <Chip 
                      label={`${(item.confidence * 100).toFixed(1)}%`}
                      size="small" 
                      color="error" 
                      sx={{ mt: 1 }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

// Helper function to get recommendations based on damage type
function getRecommendation(damageType) {
  const recommendations = {
    'Front-Windscreen-Damage': 'Requires immediate replacement to ensure safe driving visibility',
    'Headlight-Damage': 'Should be repaired promptly as it affects night visibility and is a safety hazard',
    'Rear-windscreen-Damage': 'Replacement recommended for structural integrity and visibility',
    'RunningBoard-Dent': 'Cosmetic repair recommended, structural assessment may be needed',
    'Sidemirror-Damage': 'Affects visibility, repair or replacement recommended based on severity',
    'Signlight-Damage': 'Safety hazard, repair needed to maintain proper signaling function',
    'Taillight-Damage': 'Requires repair to maintain legal road compliance and safety',
    'Bonnet-Dent': 'Cosmetic repair, check for underlying engine component damage',
    'Doorouter-Dent': 'Primarily cosmetic, check door functionality and weather sealing',
    'Fender-Dent': 'Cosmetic repair, ensure no interference with wheel movement',
    'Front-Bumper-Dent': 'May affect safety features, inspect for sensor damage',
    'Pillar-Dent': 'Structural assessment recommended as it may affect roof integrity',
    'Quaterpanel-Dent': 'Body repair needed, check for impact on trunk alignment',
    'Rear-Bumper-Dent': 'Inspect for damage to sensors or backup camera systems',
    'Roof-Dent': 'Assess for structural integrity impact, especially with sunroof systems'
  };
  return recommendations[damageType] || 'Professional assessment recommended for repair options';
}

export default DamageDetect;
