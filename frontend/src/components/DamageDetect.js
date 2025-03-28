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
  IconButton,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  Tooltip,
  Collapse,
  Modal,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TuneIcon from '@mui/icons-material/Tune';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ContrastIcon from '@mui/icons-material/Contrast';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
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
    'dent': '#FF5252',
    'scratch': '#4CAF50',
    'crack': '#2196F3',
    'glass shatter': '#FFEB3B',
    'lamp broken': '#9C27B0',
    'tire flat': '#00BCD4'
  };
  return {
    backgroundColor: alpha(colorMap[damageType] || theme.palette.error.main, 0.1),
    color: colorMap[damageType] || theme.palette.error.main,
    borderColor: colorMap[damageType] || theme.palette.error.main,
    fontWeight: 'bold',
    margin: theme.spacing(0.5),
    '& .MuiBadge-badge': {
      backgroundColor: colorMap[damageType] || theme.palette.error.main,
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

const DamageCropsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  justifyContent: 'center'
}));

const DamageCropItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `2px solid ${theme.palette.error.main}`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
  }
}));

const DamageCropLabel = styled(Box)(({ theme, damageType }) => {
  const colorMap = {
    'dent': '#FF5252',
    'scratch': '#4CAF50',
    'crack': '#2196F3',
    'glass shatter': '#FFEB3B',
    'lamp broken': '#9C27B0',
    'tire flat': '#00BCD4'
  };
  
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: alpha(colorMap[damageType] || theme.palette.error.main, 0.85),
    color: 'white',
    padding: theme.spacing(0.5, 1),
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
});

const DamageCropConfidence = styled(Box)(({ theme, confidence }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: confidence > 0.7 ? alpha('#4CAF50', 0.85) : alpha('#FF9800', 0.85),
  color: 'white',
  borderRadius: '12px',
  padding: theme.spacing(0.25, 0.75),
  fontSize: '0.7rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
}));

const ZoomIcon = styled(ZoomInIcon)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) scale(0)',
  color: 'white',
  fontSize: '2rem',
  opacity: 0,
  transition: 'all 0.2s ease',
}));

const DamageCropWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    '& .zoom-icon': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
    },
    '&::after': {
      opacity: 0.3,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  }
}));

const DamageZoomModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  padding: theme.spacing(2),
  outline: 'none',
}));

const DamageDetailBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.error.light, 0.1),
  borderRadius: theme.spacing(1),
  border: `1px dashed ${theme.palette.error.main}`,
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
  const [showSettings, setShowSettings] = useState(false);
  const [reduceReflection, setReduceReflection] = useState(false);
  const [enhanceContrast, setEnhanceContrast] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [processedImage, setProcessedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [focusOnDamage, setFocusOnDamage] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

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
      formData.append('reduce_reflection', reduceReflection);
      formData.append('enhance_contrast', enhanceContrast);
      formData.append('confidence_threshold', confidenceThreshold);
      formData.append('remove_background', removeBackground);
      formData.append('focus_on_damage', focusOnDamage);

      const response = await axios.post(
        'http://localhost:8000/damage/detect',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      if (response.data && response.data.status === 'success') {
        setAnnotatedImage(`data:image/jpeg;base64,${response.data.annotated_image}`);
        setProcessedImage(`data:image/jpeg;base64,${response.data.processed_image}`);
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

  const handleDamageCropClick = (damage) => {
    setSelectedDamage(damage);
    setZoomModalOpen(true);
  };

  const handleCloseZoomModal = () => {
    setZoomModalOpen(false);
  };

  const getDamageDescription = (damageType) => {
    const descriptions = {
      'dent': 'A depression or hollow in the surface of the vehicle. Dents can vary in size and severity, affecting the vehicle\'s appearance and sometimes the structure.',
      'scratch': 'A mark or injury on the surface of the vehicle caused by scraping. Scratches can affect the paint, clear coat, or deeper layers.',
      'crack': 'A break or split in the material, often without complete separation. Cracks in glass or plastic components can spread if not addressed.',
      'glass shatter': 'Broken or fragmented glass, typically in windows or mirrors. Shattered glass poses safety risks and requires immediate replacement.',
      'lamp broken': 'Damage to headlights, tail lights, or signal lamps. This can affect visibility and may be a legal compliance issue.',
      'tire flat': 'A deflated or punctured tire. Flat tires affect vehicle handling and safety, requiring repair or replacement.'
    };
    
    return descriptions[damageType] || 'Physical damage to the vehicle that may affect its appearance, function, or value.';
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
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Upload Image
                </Typography>
                <Tooltip title="Detection Settings">
                  <IconButton onClick={() => setShowSettings(!showSettings)} color="primary">
                    <TuneIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Collapse in={showSettings}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                    Detection Settings
                  </Typography>
                  <FormGroup>
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={reduceReflection} 
                            onChange={(e) => setReduceReflection(e.target.checked)} 
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WbSunnyIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Reduce Sun Reflections</Typography>
                          </Box>
                        }
                      />
                      <Typography variant="caption" sx={{ display: 'block', ml: 7, mt: -0.5, color: 'text.secondary' }}>
                        Helps with glare and sun reflections on the car surface
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={enhanceContrast} 
                            onChange={(e) => setEnhanceContrast(e.target.checked)} 
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ContrastIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Enhance Small Damages</Typography>
                          </Box>
                        }
                      />
                      <Typography variant="caption" sx={{ display: 'block', ml: 7, mt: -0.5, color: 'text.secondary' }}>
                        Improves detection of subtle scratches and small dents
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <ZoomInIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Detection Sensitivity: {(confidenceThreshold * 100).toFixed(0)}%
                      </Typography>
                      <Slider
                        value={confidenceThreshold}
                        onChange={(e, value) => setConfidenceThreshold(value)}
                        min={0.1}
                        max={0.5}
                        step={0.05}
                        marks={[
                          { value: 0.1, label: 'High' },
                          { value: 0.3, label: 'Med' },
                          { value: 0.5, label: 'Low' }
                        ]}
                        sx={{ ml: 1 }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', ml: 1, color: 'text.secondary' }}>
                        Lower values detect more subtle damages but may increase false positives
                      </Typography>
                    </Box>
                  </FormGroup>
                </Paper>
              </Collapse>

              <Typography variant="body2" color="text.secondary" paragraph>
                Please upload a clear image of the damaged vehicle. For best results, ensure good lighting and that the damage is clearly visible.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <StyledUploadButton 
                  component="label" 
                  startIcon={<UploadFileIcon />}
                >
                  Upload Image
                  <input 
                    type="file" 
                    hidden 
                    onChange={(event) => {
                      const file = event.target.files[0];
                      if (!file) return;

                      setImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                      setAnnotatedImage(null);
                      setDamageCrops([]);
                      setDetections([]);
                      setDamageCounts({});
                      setTotalDamage(0);
                      setError(null);
                    }}
                    accept="image/*"
                  />
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
                  {isLoading ? 'Analyzing...' : 'Analyze Image'}
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
                    borderRadius: 2,
                  }}
                >
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h6">
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
                  
                  <Box sx={{ mb: 2 }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={(e, newValue) => setActiveTab(newValue)}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                      sx={{ mb: 1 }}
                    >
                      <Tab label="Detected Damage" />
                      <Tab label="Processed Image" />
                      <Tab label="Original" />
                    </Tabs>
                    
                    <Box 
                      sx={{ 
                        width: '100%',
                        pt: '56.25%',
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {activeTab === 0 && (
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
                      )}
                      {activeTab === 1 && processedImage && (
                        <img 
                          src={processedImage} 
                          alt="Processed Image" 
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
                      )}
                      {activeTab === 2 && (
                        <img 
                          src={previewImage} 
                          alt="Original Image" 
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
                      )}
                    </Box>
                  </Box>
                  
                  {damageCrops.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" color="error" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <ZoomInIcon sx={{ mr: 0.5 }} /> Detected Damage Areas
                      </Typography>
                      
                      <DamageCropsContainer>
                        {damageCrops.map((damage, index) => (
                          <DamageCropItem key={index} onClick={() => handleDamageCropClick(damage)}>
                            <DamageCropWrapper>
                              <img 
                                src={`data:image/jpeg;base64,${damage.crop}`} 
                                alt={`Damage ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <ZoomIcon className="zoom-icon" />
                            </DamageCropWrapper>
                            <DamageCropLabel damageType={damage.class_name}>
                              {damage.class_name}
                            </DamageCropLabel>
                            <DamageCropConfidence confidence={damage.confidence}>
                              {Math.round(damage.confidence * 100)}%
                            </DamageCropConfidence>
                          </DamageCropItem>
                        ))}
                      </DamageCropsContainer>
                    </Box>
                  )}
                  
                  <DamageSummaryCard sx={{ mt: 'auto', flexGrow: 1 }}>
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
                                      label={damageType.replace(/-/g, ' ')}
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
      </Container>

      <DamageZoomModal
        open={zoomModalOpen}
        onClose={handleCloseZoomModal}
        aria-labelledby="damage-detail-modal"
        closeAfterTransition
      >
        <ModalContent>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.05)' }}
            onClick={handleCloseZoomModal}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedDamage && (
            <Box sx={{ maxWidth: '100%', textAlign: 'center' }}>
              <Typography variant="h6" color="error" gutterBottom>
                {selectedDamage.class_name.toUpperCase()} DETECTED
              </Typography>
              
              <Box sx={{ position: 'relative', mt: 1, mb: 2 }}>
                <img 
                  src={`data:image/jpeg;base64,${selectedDamage.crop}`} 
                  alt={selectedDamage.class_name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '60vh',
                    borderRadius: 8,
                    border: '3px solid rgba(244, 67, 54, 0.7)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}
                />
              </Box>
              
              <DamageDetailBox>
                <Typography variant="body1" fontWeight="medium">
                  Damage Details:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 1 }}>
                  <Chip 
                    label={`Type: ${selectedDamage.class_name}`} 
                    color="error" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Confidence: ${Math.round(selectedDamage.confidence * 100)}%`} 
                    color={selectedDamage.confidence > 0.7 ? "success" : "warning"} 
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  {getDamageDescription(selectedDamage.class_name)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 1 }}
                  onClick={handleCloseZoomModal}
                >
                  Close
                </Button>
              </DamageDetailBox>
            </Box>
          )}
        </ModalContent>
      </DamageZoomModal>
    </Box>
  );
};

export default DamageDetect;