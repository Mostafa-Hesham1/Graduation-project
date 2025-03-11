import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Alert,
  Chip,
} from '@mui/material';
import { styled, styled as muiStyled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import { carSpecsData } from './carSpecs';

const fuelTypes = ["Benzine", "Diesel", "Electric", "Hybrid", "Natural Gas"];
const ccOptions = ["1000", "1200", "1400", "1500", "1600", "1800", "2000", "2200", "2400", "2500", "3000", "3500", "4000", "4500", "5000"];
const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gray", "Yellow", "Orange", "Purple", "Brown", "Gold", "Pink"];
const listByOptions = ["dealership", "individual"];
const locationOptions = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"];
const transmissionOptions = ["Automatic", "Manual"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(new Array(currentYear - 1999 + 1), (val, index) => 1999 + index);

const HeroSection = muiStyled(Box)(({ theme }) => ({
  width: '100%', // Changed from '100vw' to '100%'
  height: '25vh',
  backgroundImage: 'url(/CAR-BG.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: 0,
  margin: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.9,
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  top: 0,
  left: 0, // Added to ensure full width alignment
  right: 0, // Added to ensure full width alignment
  overflowX: 'hidden', // Added to prevent horizontal scrolling
}));

const StyledUploadButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(1.5, 4),
  borderRadius: 8,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
    transform: 'scale(1.05)',
  },
}));

const SectionDivider = muiStyled(Box)(({ theme }) => ({
  width: '100%',
  height: '20px',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.3), transparent)',
  },
}));

const ExampleImagesTitle = muiStyled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#2c3e50',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  padding: theme.spacing(0, 0, 1, 0),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 2,
    backgroundColor: '#1e88e5',
    borderRadius: 2,
  },
}));

const ExampleImagesContainer = muiStyled(Box)(({ theme }) => ({
  border: '2px solid #1e88e5',
  borderRadius: 12,
  padding: theme.spacing(2, 2),
  background: 'linear-gradient(145deg, #ffffff, #f5f8ff)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
  width: '100%',
  maxWidth: 700,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
}));

const ExampleImageBox = muiStyled(Paper)(({ theme }) => ({
  width: '100%',
  paddingTop: '70%',
  borderRadius: 8,
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.12)',
    border: '1px solid #1976d2',
  },
  '&:active': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

const ExampleImage = muiStyled('img')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ImagePreview = muiStyled(Box)(({ theme }) => ({
  border: '3px solid rgba(0, 0, 0, 0.7)',
  borderRadius: 8,
  overflow: 'hidden',
  width: '100%',
  maxWidth: 600,
  height: 400,
  margin: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  position: 'relative',
}));

const CarIdentifier = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f7f7f7',
  padding: theme.spacing(1.5),
  borderRadius: 4,
  width: '100%',
  maxWidth: 550,
  marginTop: 0,
  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
}));

const PriceDisplay = muiStyled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  background: 'linear-gradient(45deg, #64b5f6, #81c784)',
  borderRadius: 4,
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.4rem',
  boxShadow: theme.shadows[2],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const SpecsCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  marginTop: theme.spacing(4),
}));

const SpecItem = styled(Box)(({ theme, isEven }) => ({
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: theme.spacing(1),
  margin: theme.spacing(1, 0),
  backgroundColor: isEven ? '#e8f0fe' : '#ffffff',
}));

const ColorSwatch = muiStyled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  width: 20,
  height: 20,
  borderRadius: 4,
  border: '1px solid #ccc',
  marginRight: theme.spacing(1),
}));

const ImageUpload = () => {
  const [carInfo, setCarInfo] = useState(null);
  const [carLabel, setCarLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({});
  const [price, setPrice] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const uploadCarImage = async (data) => {
    setUploadError(null);
    setConfidence(null);
    setCarLabel('');
    setCarInfo(null);
    setPrice(null);
    setInputData({});
    setIsLoading(true);
    setPreviewImage(URL.createObjectURL(data.get('file')));

    try {
      const yoloResult = await axios.post(
        'http://localhost:8000/yolo/check_car',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (yoloResult.data.car_detected) {
        const predictResult = await axios.post(
          'http://localhost:8000/predict/predict',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const prediction = predictResult.data.prediction.trim();
        const probValue = predictResult.data.probability;
        setConfidence(probValue);
        const parts = prediction.split(' ');
        setCarLabel(prediction);
        let fuel = '', cc = '', transmission = '';
        if (prediction === "Hyundai Sonata Sedan 2012") {
          fuel = 'Benzine'; cc = '2400'; transmission = 'Automatic';
        } else if (prediction === "BMW M5 Sedan 2010") {
          fuel = 'Benzine'; cc = '5000'; transmission = 'Automatic';
        } else if (prediction === "BMW X3 SUV 2012") {
          fuel = 'Benzine'; cc = '2000'; transmission = 'Automatic';
        } else if (prediction === "Hyundai Accent Sedan 2012") {
          fuel = 'Benzine'; cc = '1600'; transmission = 'Automatic';
        } else if (prediction === "Hyundai Elantra Touring Hatchback 2012") {
          fuel = 'Benzine'; cc = '1600'; transmission = 'Automatic';
        } else if (prediction === "BMW X6 SUV 2012") {
          fuel = 'Benzine'; cc = '3000'; transmission = 'Automatic';
        }
        if (parts.length === 4) {
          setInputData({
            Make: parts[0],
            Model: parts[1],
            BodyType: parts[2],
            Year: parts[3],
            FuelType: fuel,
            CC: cc,
            TransmissionType: transmission,
            Color: '',
            listBy: '',
            location: '',
            Kilometers: '',
          });
        } else if (parts.length > 4) {
          setInputData({
            Make: parts[0],
            Model: parts.slice(1, 3).join(' '),
            BodyType: parts[3],
            Year: parts[parts.length - 1],
            FuelType: fuel,
            CC: cc,
            TransmissionType: transmission,
            Color: '',
            listBy: '',
            location: '',
            Kilometers: '',
          });
        }
        const found = carSpecsData.find(car => car.Title.toLowerCase() === prediction.toLowerCase());
        setCarInfo(found || null);
      } else {
        setUploadError("No car detected in the image. Please upload an image containing a car.");
      }
    } catch (err) {
      console.error('Error:', err);
      setUploadError(err.message || "Failed to process image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateInputField = (e) => {
    setInputData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const predictCarPrice = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/price/predict_price',
        inputData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setPrice(res.data.predicted_price);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  };

  const selectExampleImage = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], 'car.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);
    await uploadCarImage(formData);
  };

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadCarImage(formData);
    }
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mt: 0, 
        p: 0,
        width: '100%', // Added to ensure full width
        maxWidth: '100%', // Added to prevent overflow
        overflowX: 'hidden' // Added to prevent horizontal scrolling
      }}>
        <HeroSection>
          <Typography variant="h5" component="h2">Upload Your Car Image</Typography>
        </HeroSection>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2, mb: 2 }}>
          <StyledUploadButton component="label">
            Upload Image
            <input type="file" hidden onChange={onFileSelect} />
          </StyledUploadButton>
        </Box>
        <SectionDivider>
          <Box sx={{ px: 2, py: 0.3, backgroundColor: '#fff', color: '#1976d2', fontWeight: 500, fontSize: '0.8rem', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            or
          </Box>
        </SectionDivider>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', my: 1 }}>
          <ExampleImagesTitle variant="h6" component="h2">
            Click on one of the following example images
          </ExampleImagesTitle>
          <ExampleImagesContainer>
            <Grid container spacing={2} justifyContent="center">
              {['/car1.jpg', '/car2222.jpg', '/car3.jpg', '/car4.jpg', '/car5555555.jpeg', '/car6.jpeg'].map((src, idx) => (
                <Grid item key={idx} xs={6} sm={2}>
                  <ExampleImageBox elevation={3} onClick={() => selectExampleImage(src)}>
                    <ExampleImage src={src} alt={`Example ${idx + 1}`} />
                  </ExampleImageBox>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666', display: 'inline-block', px: 1, py: 0.5, borderRadius: '16px', background: 'rgba(0,0,0,0.03)', fontSize: '0.8rem' }}>
                Select any example to instantly see how our AI identifies the vehicle
              </Typography>
            </Box>
          </ExampleImagesContainer>
        </Box>
        {isLoading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={48} />
          </Box>
        )}
        {previewImage && !carLabel && (
          <Box sx={{ mt: 2, width: '100%', maxWidth: 600 }}>
            <ImagePreview>
              <img src={previewImage} alt="Uploaded Car" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </ImagePreview>
            {uploadError && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <Alert severity="error" sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, mb: 2 }} onClose={() => setUploadError(null)}>
                  <Typography variant="body1">{uploadError}</Typography>
                </Alert>
                <Typography variant="subtitle1" color="error" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Image does not contain a car
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {previewImage && carLabel && (
          <Grid container spacing={2} sx={{ mt: 2, width: '100%', maxWidth: 1200 }} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box>
                <ImagePreview>
                  <img src={previewImage} alt="Uploaded Car" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </ImagePreview>
                <CarIdentifier>
                  <DirectionsCarIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Car Identified: {carLabel}</Typography>
                  {confidence !== null && (
                    <Chip label={`${(confidence * 100).toFixed(2)}%`} color={confidence > 0.8 ? "success" : confidence > 0.6 ? "warning" : "error"} size="small" sx={{ ml: 2, fontWeight: 'bold' }} />
                  )}
                </CarIdentifier>
              </Box>
            </Grid>
            {carLabel && (
              <Grid item xs={12} md={6}>
                <form onSubmit={predictCarPrice} style={{ width: '100%' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField name="Make" label="Make" value={inputData.Make || ''} onChange={updateInputField} margin="normal" fullWidth required
                        InputProps={{ startAdornment: (<InputAdornment position="start"><DirectionsCarIcon /></InputAdornment>) }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField name="Model" label="Model" value={inputData.Model || ''} onChange={updateInputField} margin="normal" fullWidth required
                        InputProps={{ startAdornment: (<InputAdornment position="start"><DirectionsCarIcon /></InputAdornment>) }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField name="BodyType" label="Body Type" value={inputData.BodyType || ''} onChange={updateInputField} margin="normal" fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField name="Year" label="Year" value={inputData.Year || ''} onChange={updateInputField} margin="normal" fullWidth required
                        InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarTodayIcon /></InputAdornment>) }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Fuel Type</InputLabel>
                        <Select name="FuelType" value={inputData.FuelType || ''} onChange={updateInputField} label="Fuel Type">
                          {fuelTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>CC</InputLabel>
                        <Select name="CC" value={inputData.CC || ''} onChange={updateInputField} label="CC">
                          {ccOptions.map((cc) => (<MenuItem key={cc} value={cc}>{cc}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Color</InputLabel>
                        <Select name="Color" value={inputData.Color || ''} onChange={updateInputField} label="Color">
                          {colorOptions.map((color) => (<MenuItem key={color} value={color}>{color}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>List By</InputLabel>
                        <Select name="listBy" value={inputData.listBy || ''} onChange={updateInputField} label="List By">
                          {listByOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Location</InputLabel>
                        <Select name="location" value={inputData.location || ''} onChange={updateInputField} label="Location"
                          startAdornment={<InputAdornment position="start"><LocationOnIcon /></InputAdornment>}>
                          {locationOptions.map((loc) => (<MenuItem key={loc} value={loc}>{loc}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Transmission Type</InputLabel>
                        <Select name="TransmissionType" value={inputData.TransmissionType || ''} onChange={updateInputField} label="Transmission Type"
                          startAdornment={<InputAdornment position="start"><SettingsIcon /></InputAdornment>}>
                          {transmissionOptions.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField name="Kilometers" label="Kilometers" value={inputData.Kilometers || ''} onChange={updateInputField} margin="normal" fullWidth required
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SpeedIcon /></InputAdornment>) }} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary" sx={{ height: '40px', fontSize: '1rem' }}>
                      Predict Price
                    </Button>
                  </Box>
                  {price && (
                    <PriceDisplay>
                      <AttachMoneyIcon sx={{ mr: 1 }} />
                      <Typography>Predicted Price: EGP {price.toLocaleString()}</Typography>
                    </PriceDisplay>
                  )}
                </form>
              </Grid>
            )}
          </Grid>
        )}
        {carInfo && (
          <SpecsCard sx={{ mt: 4, width: '100%' }}>
            <CardContent>
              {carInfo.Title && (
                <SpecItem style={{ backgroundColor: 'white' }}>
                  <Typography>Title: {carInfo.Title}</Typography>
                </SpecItem>
              )}
              {carInfo["Key Specs"] && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Key Specifications</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Specification</th>
                          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Body Style</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["Body Style"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Seating Capacity</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["Seating Capacity"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Engine</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["Engine"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>MPG</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["MPG"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Dimensions</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["Dimensions"]
                              ? `Length: ${carInfo["Key Specs"]["Dimensions"]["Length"]}, Height: ${carInfo["Key Specs"]["Dimensions"]["Height"]}`
                              : 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Drive Type</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Key Specs"]["Drive Type"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>CC</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {inputData.CC || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Transmission Type</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {inputData.TransmissionType || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Fuel Type</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {inputData.FuelType || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
              {carInfo["Color Options"] && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Color Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>Exterior:</Typography>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Color</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carInfo["Color Options"]["Exterior"].map((clr, idx) => (
                            <tr key={clr} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f0f0f0' }}>
                              <td style={{ border: '1px solid #ccc', padding: '8px', display: 'flex', alignItems: 'center' }}>
                                <ColorSwatch color={clr} />
                                <span>{clr}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Interior:</Typography>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Color</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carInfo["Color Options"]["Interior"].map((clr, idx) => (
                            <tr key={clr} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f0f0f0' }}>
                              <td style={{ border: '1px solid #ccc', padding: '8px', display: 'flex', alignItems: 'center' }}>
                                <ColorSwatch color={clr} />
                                <span>{clr}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
              {carInfo["Specifications"] && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Full Specifications</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Specification</th>
                          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Engine Type</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Type"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Horsepower</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Horsepower"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Torque</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Torque"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Displacement</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Displacement"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Transmission</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Transmission"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Cooling System Capacity</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Engine"]["Cooling System Capacity"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>ABS System</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Brakes"]["ABS System"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Passenger Capacity</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Measurements"]["Passenger Capacity"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: 'white' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Overall Height</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Measurements"]["Overall Height"] || 'N/A'}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>Base Curb Weight</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {carInfo["Specifications"]["Weight & Capacity"]["Base Curb Weight"] || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </SpecsCard>
        )}
      </Box>
    </>
  );
};

export default ImageUpload;
