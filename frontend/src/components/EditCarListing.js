import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
} from '@mui/material';
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
  Delete as DeleteIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getListingById, updateCarListing } from '../api';

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

const ImageThumbnail = styled(Box)(({ theme, isSelected }) => ({
  width: 60,
  height: 60,
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer',
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  position: 'relative',
  '&:hover .delete-overlay': {
    opacity: 1,
  },
}));

const DeleteOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s',
  cursor: 'pointer',
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

const EditCarListing = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    description: '',
  });
  
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [models, setModels] = useState([]);
  
  // Fetch the car listing data when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchListing = async () => {
      try {
        setLoading(true);
        console.log('Fetching listing with ID:', id);
        
        if (!id) {
          setError('Missing listing ID parameter');
          setLoading(false);
          return;
        }
        
        const listingData = await getListingById(id);
        
        if (!listingData) {
          setError('Listing not found');
          return;
        }
        
        // Check if the user is the owner of this listing
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.id !== listingData.owner_id) {
          setError('You do not have permission to edit this listing');
          return;
        }
        
        // Set models for the selected make
        if (listingData.make) {
          setModels(carData[listingData.make] || []);
        }
        
        // Format the listing data for the form
        setFormData({
          title: listingData.title || '',
          make: listingData.make || '',
          model: listingData.model || '',
          year: listingData.year || '',
          bodyType: listingData.bodyType || '',
          fuelType: listingData.fuelType || '',
          cc: listingData.cc || '',
          location: listingData.location || '',
          kilometers: listingData.kilometers || '',
          transmissionType: listingData.transmissionType || '',
          color: listingData.color || '',
          condition: listingData.condition || '',
          chatOption: listingData.chatOption || 'chatOnly',
          showPhoneNumber: listingData.showPhoneNumber || false,
          price: listingData.price || '',
          description: listingData.description || '',
        });
        
        // Set the images
        if (listingData.images && Array.isArray(listingData.images)) {
          setImages(listingData.images);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id, isAuthenticated, navigate]);
  
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
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + newImages.length + files.length <= 5) {
      setNewImages(prevImages => [...prevImages, ...files]);
    } else {
      setSnackbar({
        open: true,
        message: 'You can upload a maximum of 5 images.',
        severity: 'warning'
      });
    }
  };
  
  const handleDeleteImage = (index, isNewImage = false) => {
    if (isNewImage) {
      // Delete from newImages
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    } else {
      // Mark existing image for deletion and remove from images array
      const imageToDelete = images[index];
      setImagesToDelete(prev => [...prev, imageToDelete]);
      setImages(prev => prev.filter((_, i) => i !== index));
      if (currentImageIndex >= images.length - 1) {
        setCurrentImageIndex(Math.max(0, images.length - 2));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Create FormData object for submission
      const updateFormData = new FormData();
      
      // Add form fields
      for (const key in formData) {
        updateFormData.append(key, formData[key]);
      }
      
      // Add new images if any
      if (newImages.length > 0) {
        newImages.forEach(image => {
          updateFormData.append('newImages', image);
        });
      }
      
      // Add remaining existing images
      updateFormData.append('existingImages', JSON.stringify(images));
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        updateFormData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      // Add phone number if showPhoneNumber is enabled
      if (formData.showPhoneNumber && user && user.phone) {
        updateFormData.append("phoneNumber", user.phone);
      }
      
      // Submit the form
      const response = await updateCarListing(id, updateFormData);
      
      setSnackbar({
        open: true,
        message: 'Your car listing has been updated successfully!',
        severity: 'success',
      });
      
      // Redirect to my listings after success
      setTimeout(() => {
        navigate('/my-listings');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating listing:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update listing',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const getImageUrl = (imageName) => {
    if (!imageName) return '';
    
    return `http://localhost:8000/uploads/${imageName}`;
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                onChange={handleCheckboxChange}
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
  
  if (!isAuthenticated) {
    return <CircularProgress />;
  }
  
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh">
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading listing details...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh">
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/my-listings')}
          sx={{ mt: 2 }}
        >
          Back to My Listings
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 8, px: { xs: 2, sm: 4 } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/my-listings"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          My Listings
        </Link>
        <Typography color="text.primary">Edit Listing</Typography>
      </Breadcrumbs>
      
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
        Edit Car Listing
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      <ListingPaper>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Box mb={5}>
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
          </Box>
          
          {/* Vehicle Specifications */}
          <Box mb={5}>
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
          </Box>
          
          {/* Photos & Pricing */}
          <Box mb={4}>
            <SectionTitle variant="h6">Photos & Pricing</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ mb: 2, borderRadius: theme.spacing(1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AddPhotoAlternate color="primary" />
                      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                        Car Photos
                      </Typography>
                    </Box>
                    
                    {/* Existing images */}
                    {images.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Images
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1,
                            mb: 2
                          }}
                        >
                          {images.map((image, index) => (
                            <ImageThumbnail 
                              key={index} 
                              isSelected={false}
                            >
                              <img 
                                src={getImageUrl(image)} 
                                alt={`Car ${index}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <DeleteOverlay 
                                className="delete-overlay"
                                onClick={() => handleDeleteImage(index)}
                              >
                                <DeleteIcon sx={{ color: 'white' }} />
                              </DeleteOverlay>
                            </ImageThumbnail>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* New images */}
                    {newImages.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          New Images to Add
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1,
                            mb: 2
                          }}
                        >
                          {newImages.map((image, index) => (
                            <ImageThumbnail 
                              key={index} 
                              isSelected={false}
                            >
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt={`New car ${index}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <DeleteOverlay 
                                className="delete-overlay"
                                onClick={() => handleDeleteImage(index, true)}
                              >
                                <DeleteIcon sx={{ color: 'white' }} />
                              </DeleteOverlay>
                            </ImageThumbnail>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Upload button */}
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
                        disabled={images.length + newImages.length >= 5}
                      >
                        Add More Images
                        <input 
                          type="file" 
                          multiple 
                          hidden 
                          onChange={handleImageChange} 
                          accept="image/*" 
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {images.length + newImages.length}/5 images uploaded
                        {images.length + newImages.length >= 5 && " (maximum reached)"}
                      </Typography>
                    </Box>
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
            </Grid>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/my-listings')}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: theme.spacing(1) }}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={submitting}
              startIcon={submitting ? null : <SaveIcon />}
              sx={{ 
                borderRadius: theme.spacing(1),
                position: 'relative',
                minWidth: 150
              }}
            >
              {submitting ? 'Updating...' : 'Update Listing'}
              {submitting && (
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
          </Box>
        </Box>
      </ListingPaper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
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

export default EditCarListing;