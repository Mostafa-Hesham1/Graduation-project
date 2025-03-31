import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Grid,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  useTheme,
  InputAdornment,
  alpha,
  styled,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { uploadCarListing } from '../api';
import { 
  ArrowForward, 
  ArrowBack, 
  AddPhotoAlternate,
  DirectionsCar,
  LocalOffer,
  Description,
  Speed,
  ColorLens,
  LocationOn,
  CalendarToday,
  Category,
  LocalGasStation,
  Settings,
  CheckCircle,
  FiberNew,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ListingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
}));

const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0, 5, 0),
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '250px',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.light,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  paddingLeft: theme.spacing(2),
  '&:before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 4,
    height: '70%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
}));

const carData = {
  "Alfa Romeo": ["156", "Giulia", "Giulietta", "Mito"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 E-Tron", "Q5", "Q5 E-Tron", "Q7", "Q8", "S3/RS3"],
  "BMW": ["116", "118", "218", "316", "318", "320", "328", "330", "335", "340", "418", "420", "430", "520", "523", "525", "528", "530", "535", "640", "730", "740", "750", "850", "I3", "I5", "I8", "IX3", "M3", "M4", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "Z4 M30"],
  "BYD": ["F0", "F3", "L3", "S5", "Song Plus"],
  "Baic": ["X3", "X7"],
  "Bentley": ["Continental"],
  "Bestune": ["T77 Pro"],
  "Brilliance": ["FRV", "FRV Cross", "FSV", "V5"],
  "Buick": ["Skylark"],
  "Cadillac": ["DTS", "Escalade"],
  "Chana": ["Benni"],
  "Changan": ["Alsvin", "CS35", "CS55", "V7"],
  "Changhe": ["Ideal"],
  "Chery": ["A11", "Arrizo 5", "Envy", "Tiggo", "Tiggo 4"],
  "Chevrolet": ["Aveo", "Camaro", "Captiva", "Cruze", "Equinox", "Lanos", "Malibu", "N200", "N300", "Optra", "Pickup/Dababa", "Sonic", "Spark", "Tahoe"],
  "Chrysler": ["C300", "M300", "Pacifica", "Town and Country"],
  "Citroen": ["AX", "C-Elysée", "C3", "C3 Picasso", "C4", "C4 Grand Picasso", "C4 Picasso", "C5", "DS3", "DS4", "DS5", "DS7", "Xsara", "Xsara Picasso"],
  "Cupra": ["Formentor", "Leon"],
  "DFSK": ["Eagle 580", "Glory 330"],
  "Daewoo": ["Cielo", "Espero", "Juliet", "Lacetti", "Lanos", "Leganza", "Nubira", "Racer"],
  "Daihatsu": ["Charade", "Gran Max", "Grand Terios", "Mira", "Sirion", "Terios"],
  "Dodge": ["Challenger", "Charger", "Dart"],
  "Faw": ["Van"],
  "Fiat": ["125", "127", "128", "128 Nova", "1300", "131", "132", "500", "500X", "Albea", "Bravo", "Florida", "Grand Punto", "Linea", "Marea", "Polonez", "Punto", "Regata", "Shahin", "Siena", "Tempra", "Tipo", "Uno"],
  "Ford": ["B-Max", "EcoSport", "Edge", "F150", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo"],
  "GAC": ["EMKOO", "EMZOOM"],
  "GMC": ["Acadia"],
  "Geely": ["Coolray", "Emgrand 7", "Emgrand X7", "Pandido"],
  "Great Wall": ["C30"],
  "Haval": ["H6", "Jolion"],
  "Honda": ["Accord", "CR-V", "City", "Civic", "ENP", "Jazz", "Odyssey"],
  "Hummer": [],
  "Hyundai": ["Accent", "Atos", "Avante", "Bayon", "Coupe", "Creta", "Elantra", "Excel", "Getz", "Grand I10", "I10", "I20", "I30", "IX20", "IX35", "Matrix", "Solaris", "Sonata", "Tucson", "Veloster", "Verna", "Viva"],
  "Infiniti": ["FX"],
  "Isuzu": ["D-Max"],
  "Jac": ["J7", "JS3", "JS4", "S2", "S4"],
  "Jaguar": ["F-Pace", "F-type", "X-Type", "XE", "XF"],
  "Jeep": ["Cherokee", "Compass", "Grand Cherokee", "Grand cherokee 4xe", "Liberty", "Renegade", "Wrangler"],
  "Jetour": ["X70", "X95"],
  "Kia": ["Carens", "Carnival", "Ceed", "Cerato", "Cerato Coupe", "EV6", "K3", "K5", "Picanto", "Pride", "Rio", "Sephia", "Shuma", "Sorento", "Sorento Hybrid", "Soul", "Spectra", "Sportage", "Sportage Plug-in Hybrid", "Xceed"],
  "King Long": ["Van"],
  "Lada": ["1200", "1500", "2105", "2106", "2107", "Granta", "Niva", "Samara"],
  "Lancia": ["Dedra"],
  "Land Rover": ["Discovery", "Discovery Sport", "Evoque", "Range Rover", "Range Rover Sport", "Range Rover Sport SVR", "Range Rover Vogue", "Velar"],
  "Lexus": ["LX"],
  "Lincoln": ["Navigator"],
  "MG": ["HS", "MG 5", "MG 6", "RX5", "ZS"],
  "MINI": ["Cooper", "Cooper Paceman", "Cooper Roadster", "Cooper s", "Countryman", "Countryman S"],
  "Maserati": ["Quattroporte"],
  "Mazda": ["2", "3", "323", "929", "CX"],
  "Mercedes-Benz": ["200", "230", "A150", "A180", "A200", "A35", "A45", "B150", "B160", "B180", "B200", "C180", "C200", "C230", "C250", "C280", "C300", "CLA 180", "CLA 200", "CLE 200", "CLS", "E180", "E200", "E230", "E240", "E250", "E280", "E300", "E320", "E350", "E400", "EQE 350", "EQS 450", "G-Class", "G63", "GL-Class", "GLA 200", "GLC 200", "GLC 250", "GLC 300", "GLE-Class", "GLK 250", "GLK 300", "GLK 350", "GLS", "S300", "S320", "S350", "S400", "S450", "S500", "S560", "S580", "SEL 300", "SLC-Class", "Viano"],
  "Mitsubishi": ["Atrage", "Colt", "Eclipse", "Lancer", "Mirage", "Pajero", "Xpander"],
  "Nissan": ["Bluebird", "Juke", "Pickup", "Qashqai", "Sentra", "Sunny", "Tiida", "X-Trail"],
  "Opel": ["Astra", "Cascada", "Corsa", "Crossland", "Grandland", "Insignia", "Meriva", "Mokka", "Rekord", "Vectra"],
  "Other make": ["Haima", "Kenbo", "Smart"],
  "Peugeot": ["2008", "206", "207", "207 SW", "208", "3008", "301", "307", "307 SW", "308", "405", "406", "407", "408", "5008", "504", "504 SW", "508", "RCZ"],
  "Porsche": ["Boxster", "Carrera", "Cayenne", "Cayman", "Macan"],
  "Proton": ["Gen-2", "Preve", "Saga"],
  "Renault": ["12", "14", "9", "Austral", "Captur", "Clio", "Duster", "Fluence", "Kadjar", "Logan", "Megane", "Optima", "Sandero", "Sandero Stepway", "Symbol"],
  "Rolls Royce": ["Ghost"],
  "Saipa": ["Pride", "Pride Sedan"],
  "Seat": ["Arona", "Ateca", "Cordoba", "Ibiza", "Leon", "Tarraco", "Toledo"],
  "Senova": ["A1"],
  "Skoda": ["Fabia", "Favorit", "Felecia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Roomster", "Superb"],
  "Soueast": ["DX 8S"],
  "Speranza": ["A113", "A213", "A516", "A620", "Envy", "M11", "M12", "Tiggo"],
  "Ssang Yong": ["Tivoli", "Tivoli XLV"],
  "Subaru": ["Impreza", "Legacy", "XV"],
  "Suzuki": ["Alto", "Baleno", "Celerio", "Ciaz", "Dzire", "Ertiga", "Grand Vitara", "Jimny", "Maruti", "Pick up", "S-Presso", "Swift", "Van", "Vitara"],
  "Tesla": ["Model 3", "Model S"],
  "Toyota": ["Auris", "Avanza", "Belta", "C-HR", "Camry", "Corolla", "Corona", "Echo", "Fortuner", "Hiace", "Hilux", "Land Cruiser", "Prado", "Rav 4", "Rush", "Yaris"],
  "Volkswagen": ["Beetle", "Bora", "CC", "Golf", "ID4", "ID6", "Jetta", "Passat", "Pointer", "Polo", "Scirocco", "Souran", "Tiguan", "Touareg"],
  "Volvo": ["240", "244", "XC40", "XC60", "XC90", "s60", "s80"],
  "Zotye": ["Explosion", "T600"]
};

const bodyTypeOptions = [
  "SEDAN",
  "COUPE",
  "SPORTS CAR",
  "HATCHBACK",
  "CONVERTIBLE",
  "SUV",
  "MINIVAN",
  "PICKUP TRUCK",
  "STATION WAGON"
];

const colorOptions = [
  "Red", "Blue", "Green", "Black", "White", "Silver", "Gray", "Yellow", "Orange", "Purple", "Brown", "Gold", "Pink"
];

const fuelTypeOptions = [
  "Benzine", "Diesel", "Electric", "Hybrid", "Natural Gas"
];

const locationOptions = [
  "Cairo", "Alexandria", "Giza", "Luxor", "Aswan"
];

const conditionOptions = [
  "New", "Used"
];

const CarListing = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    bodyType: '',
    fuelType: '',
    cc: '',
    location: '',
    kilometers: '',
    transmissionType: '',
    color: '',
    condition: '',
    chatOption: 'chatOnly',
    showPhoneNumber: false,
    price: '',
    images: [],
    description: '',
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [models, setModels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && user.phone) {
      setFormData(prevData => ({
        ...prevData,
        mobileNumber: user.phone
      }));
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'make') {
      setModels(carData[value] || []);
      setFormData((prevData) => ({ ...prevData, model: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length <= 5) {
      setFormData({ ...formData, images: [...formData.images, ...files] });
      setCurrentImageIndex(0);
    } else {
      setSnackbar({
        open: true,
        message: 'You can upload a maximum of 5 images.',
        severity: 'warning'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const carFormData = new FormData();
      for (const key in formData) {
        if (key !== 'images') {
          carFormData.append(key, formData[key]);
        }
      }

      // Explicitly add the phone number to FormData if the user wants to show it
      if (formData.showPhoneNumber && user && user.phone) {
        carFormData.append("phoneNumber", user.phone);
        console.log("Adding user phone number to form data:", user.phone);
      }

      if (formData.images.length > 0) {
        formData.images.forEach((image) => {
          carFormData.append('images', image);
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Please upload at least one image.',
          severity: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      carFormData.append("showPhoneNumber", formData.showPhoneNumber);

      // Log entire form data for debugging
      console.log("Form data entries:");
      for (let [key, value] of carFormData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await uploadCarListing(carFormData);
      console.log("Upload successful:", response);

      setSnackbar({
        open: true,
        message: 'Your car has been listed successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/my-listings');
      }, 1500);
    } catch (error) {
      console.error('Error uploading car listing:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload car listing.',
        severity: 'error',
      });
      setIsSubmitting(false);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < formData.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setCurrentImageIndex(0);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const closeSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const renderContactOptions = () => {
    return (
      <Grid item xs={12}>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Contact Options
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.showPhoneNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  showPhoneNumber: e.target.checked
                })}
                name="showPhoneNumber"
                color="primary"
              />
            }
            label={
              <Typography>
                Show my phone number in the listing ({user?.phone || "Not available"})
              </Typography>
            }
          />
          
          <FormHelperText>
            {formData.showPhoneNumber 
              ? "Your phone number will be visible to potential buyers."
              : "Buyers will only be able to contact you through the messaging system."}
          </FormHelperText>
        </Paper>
      </Grid>
    );
  };

  const steps = ['Vehicle Details', 'Specifications', 'Photos & Price'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StepContent>
            <SectionTitle variant="h6">Basic Information</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  name="title" 
                  label="Title" 
                  value={formData.title}
                  onChange={handleChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCar color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Make</InputLabel>
                  <Select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    label="Make"
                    startAdornment={<Category color="primary" style={{marginRight: 8}} />}
                  >
                    {Object.keys(carData).map((make) => (
                      <MenuItem key={make} value={make}>
                        {make}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined" disabled={!formData.make}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    label="Model"
                  >
                    {formData.make && models.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Year</InputLabel>
                  <Select 
                    name="year" 
                    value={formData.year}
                    onChange={handleChange}
                    label="Year"
                    startAdornment={<CalendarToday color="primary" style={{marginRight: 8}} />}
                  >
                    {Array.from({length: new Date().getFullYear() - 1999 + 1}, (_, i) => (
                      <MenuItem key={1999 + i} value={1999 + i}>
                        {1999 + i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    label="Condition"
                    startAdornment={<FiberNew color="primary" style={{marginRight: 8}} />}
                  >
                    {conditionOptions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {renderContactOptions()}
            </Grid>
          </StepContent>
        );
      case 1:
        return (
          <StepContent>
            <SectionTitle variant="h6">Vehicle Specifications</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Body Type</InputLabel>
                  <Select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleChange}
                    label="Body Type"
                    startAdornment={<DirectionsCar color="primary" style={{marginRight: 8}} />}
                  >
                    {bodyTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Color</InputLabel>
                  <Select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    label="Color"
                    startAdornment={<ColorLens color="primary" style={{marginRight: 8}} />}
                  >
                    {colorOptions.map((color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    label="Fuel Type"
                    startAdornment={<LocalGasStation color="primary" style={{marginRight: 8}} />}
                  >
                    {fuelTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="cc" 
                  label="CC" 
                  type="number" 
                  value={formData.cc}
                  onChange={handleChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Settings color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    label="Location"
                    startAdornment={<LocationOn color="primary" style={{marginRight: 8}} />}
                  >
                    {locationOptions.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="kilometers" 
                  label="Kilometers" 
                  type="number" 
                  value={formData.kilometers}
                  onChange={handleChange} 
                  required 
                  fullWidth 
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Speed color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel>Transmission Type</InputLabel>
                  <Select 
                    name="transmissionType" 
                    value={formData.transmissionType}
                    onChange={handleChange}
                    label="Transmission Type"
                    startAdornment={<Settings color="primary" style={{marginRight: 8}} />}
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description (Optional)"
                  placeholder="Enter a description of the car (optional)"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <Description color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </StepContent>
        );
      case 2:
        return (
          <StepContent>
            <SectionTitle variant="h6">Photos & Pricing</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ mb: 2, borderRadius: theme.spacing(1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AddPhotoAlternate color="primary" />
                      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                        Upload Car Photos
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2 
                    }}>
                      <Button 
                        variant="contained" 
                        component="label" 
                        startIcon={<AddPhotoAlternate />}
                        sx={{ borderRadius: theme.spacing(1) }}
                      >
                        Upload Images
                        <input 
                          type="file" 
                          multiple 
                          hidden 
                          onChange={handleImageChange} 
                          accept="image/*" 
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Upload up to 5 high-quality images of your car (Max 5MB each)
                      </Typography>
                    </Box>
                    
                    <ImagePreviewBox sx={{ mt: 2 }}>
                      {formData.images.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ position: 'relative', mb: 2, maxWidth: '100%', textAlign: 'center' }}>
                            <img
                              src={URL.createObjectURL(formData.images[currentImageIndex])}
                              alt="Uploaded"
                              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                            />
                            <IconButton
                              onClick={() => handleRemoveImage(currentImageIndex)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'white',
                                boxShadow: 2,
                                '&:hover': { bgcolor: '#f5f5f5' }
                              }}
                              size="small"
                            >
                              <Typography variant="body2" color="error">X</Typography>
                            </IconButton>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <IconButton 
                              onClick={handlePrevImage} 
                              disabled={currentImageIndex === 0}
                              color="primary"
                            >
                              <ArrowBack />
                            </IconButton>
                            <Typography sx={{ mx: 2 }}>
                              {currentImageIndex + 1} of {formData.images.length}
                            </Typography>
                            <IconButton 
                              onClick={handleNextImage} 
                              disabled={currentImageIndex === formData.images.length - 1}
                              color="primary"
                            >
                              <ArrowForward />
                            </IconButton>
                          </Box>
                          
                          {formData.images.length > 1 && (
                            <Box sx={{ display: 'flex', mt: 2, gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {formData.images.map((img, idx) => (
                                <Box 
                                  key={idx} 
                                  onClick={() => setCurrentImageIndex(idx)}
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    border: idx === currentImageIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <img 
                                    src={URL.createObjectURL(img)} 
                                    alt={`Thumbnail ${idx}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <AddPhotoAlternate style={{ fontSize: 48, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            No images uploaded yet
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Click the Upload button above to add photos
                          </Typography>
                        </Box>
                      )}
                    </ImagePreviewBox>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="price"
                  label="Price (EGP)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    By listing your car, you agree to our Terms of Service and Privacy Policy.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </StepContent>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 8, px: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          mb: 3 
        }}
      >
        <DirectionsCar sx={{ mr: 1, fontSize: 32 }} />
        List Your Car
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      <ListingPaper>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box component="form" onSubmit={(activeStep === steps.length - 1) ? handleSubmit : undefined}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: theme.spacing(1) }}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                endIcon={isSubmitting ? null : <CheckCircle />}
                sx={{ 
                  borderRadius: theme.spacing(1),
                  position: 'relative'
                }}
              >
                {isSubmitting ? 'Listing...' : 'List Your Car'}
                {isSubmitting && (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }} 
                  />
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{ borderRadius: theme.spacing(1) }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </ListingPaper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CarListing;