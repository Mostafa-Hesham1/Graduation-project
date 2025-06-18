import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  CircularProgress,
  Slider,
  InputAdornment,
  Fade,
  Grow,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  styled
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import EventIcon from '@mui/icons-material/Event';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '25vh',
  backgroundImage: 'url(/price-prediction-bg.jpg)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
    borderTopLeftRadius: theme.spacing(2),
    borderTopRightRadius: theme.spacing(2),
  }
}));

const ResultCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f8fe 100%)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const PriceDisplay = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
  color: 'white',
  borderRadius: 12,
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    transform: 'rotate(30deg)',
  }
}));

const AnimatedValue = styled(Typography)(({ theme }) => ({
  animation: 'pulse 1.5s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
    }
  },
  marginBottom: theme.spacing(2.5),
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: alpha => alpha ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
  border: `1px solid ${theme.palette.primary.main}`,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  }
}));

const SliderLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Car data constants
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
  "Mercedes-Benz": ["200", "230", "A150", "A180", "A200", "A35", "A45", "B150", "B160", "B180", "B200", "C180", "C200", "C230", "C250", "C280", "C300", "CLA 180", "CLA 200", "CLE 200", "CLS", "E180", "E200", "E230", "E240", "E250", "E280", "E300", "E320", "E350", "EQE 350", "EQS 450", "G-Class", "G63", "GL-Class", "GLA 200", "GLC 200", "GLC 250", "GLC 300", "GLE-Class", "GLK 250", "GLK 300", "GLK 350", "GLS", "S300", "S320", "S350", "S400", "S450", "S500", "S560", "S580", "SEL 300", "SLC-Class", "Viano"],
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

const bodyTypes = [
  "Sedan",
  "COUPE",
  "Sports CAR",
  "Hatchback",
  "Convertible",
  "SUV",
  "MINIVAN",
  "PICKUP TRUCK",
  "STATION WAGON",
  "4X4"
];

const colors = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Brown", "Gold"];
const fuelTypes = ["Benzine", "Diesel", "Electric", "Hybrid", "Natural Gas"];
const transmissionTypes = ["Automatic", "Manual"];
const locations = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Mansoura", "Tanta", "Port Said"];
const listByOptions = ["Dealership", "Individual"];
const ccOptions = ["1000", "1200", "1300", "1400", "1500", "1600", "1800", "2000", "2200", "2400", "2500", "3000", "3500", "4000", "4500", "5000", "5500", "6000"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 25 }, (_, i) => (currentYear - i).toString());

const PricePrediction = () => {
  // Form state
  const [formData, setFormData] = useState({
    Make: "",
    Model: "",
    BodyType: "",
    Color: "",
    Kilometers: "",
    Year: currentYear.toString(),
    FuelType: "",
    TransmissionType: "",
    CC: "",
    location: "",
    listBy: ""
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const [modelOptions, setModelOptions] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [manualKilometers, setManualKilometers] = useState(false);

  // Load dynamic model options based on selected make
  useEffect(() => {
    if (formData.Make) {
      setModelOptions(carData[formData.Make] || []);
    } else {
      setModelOptions([]);
    }
  }, [formData.Make]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleKilometersChange = (_, newValue) => {
    setFormData({
      ...formData,
      Kilometers: newValue.toString()
    });
  };

  const toggleKilometersInput = () => {
    setManualKilometers(!manualKilometers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrice(null);

    try {
      // Validate required fields
      const requiredFields = ['Make', 'Model', 'Year', 'FuelType', 'TransmissionType', 'Kilometers'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const response = await axios.post(
        'http://localhost:8000/price/predict_price',
        formData
      );

      if (response.data && response.data.predicted_price) {
        setPrice(response.data.predicted_price);
        // Show recommendations after successful prediction
        setShowRecommendations(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error predicting price:', err);
      setError(err.message || 'Failed to predict price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      {/* Hero Section */}
      <HeroSection>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Car Price Prediction
          </Typography>
          <Typography variant="body1">
            Get an accurate market price estimate for your vehicle
          </Typography>
        </Box>
      </HeroSection>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Form Column */}
          <Grid item xs={12} md={8}>
            <FormPaper elevation={3}>
              <Typography variant="h5" fontWeight="500" mb={3} color="primary">
                Enter Vehicle Details
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* Make & Model */}
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Make*</InputLabel>
                      <Select
                        name="Make"
                        value={formData.Make}
                        onChange={handleInputChange}
                        label="Make"
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <DirectionsCarIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {Object.keys(carData).map((make) => (
                          <MenuItem key={make} value={make}>{make}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Model*</InputLabel>
                      <Select
                        name="Model"
                        value={formData.Model}
                        onChange={handleInputChange}
                        label="Model"
                        required
                        disabled={!formData.Make}
                      >
                        {modelOptions.map((model) => (
                          <MenuItem key={model} value={model}>{model}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Year & Body Type */}
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Year*</InputLabel>
                      <Select
                        name="Year"
                        value={formData.Year}
                        onChange={handleInputChange}
                        label="Year"
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <EventIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {yearOptions.map((year) => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Body Type</InputLabel>
                      <Select
                        name="BodyType"
                        value={formData.BodyType}
                        onChange={handleInputChange}
                        label="Body Type"
                      >
                        {bodyTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Kilometers Input - either slider or direct input */}
                  <Grid item xs={12}>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <SliderLabel>
                          <SpeedIcon color="primary" />
                          Kilometers* ({formData.Kilometers || 0} km)
                        </SliderLabel>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={toggleKilometersInput}
                          sx={{ borderRadius: 4, fontSize: '0.75rem', py: 0.5 }}
                        >
                          {manualKilometers ? 'Use Slider' : 'Enter Manually'}
                        </Button>
                      </Box>
                      
                      {manualKilometers ? (
                        <TextField 
                          name="Kilometers"
                          label="Kilometers"
                          value={formData.Kilometers}
                          onChange={handleInputChange}
                          type="number"
                          fullWidth
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">km</InputAdornment>,
                          }}
                          sx={{ mb: 1 }}
                        />
                      ) : (
                        <Slider
                          value={parseInt(formData.Kilometers || 0)}
                          onChange={handleKilometersChange}
                          min={0}
                          max={300000}
                          step={5000}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 100000, label: '100k' },
                            { value: 200000, label: '200k' },
                            { value: 300000, label: '300k' }
                          ]}
                          sx={{
                            '& .MuiSlider-thumb': {
                              height: 24,
                              width: 24,
                              '&:hover, &.Mui-focusVisible': {
                                boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'
                              }
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Color & Fuel Type */}
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Color</InputLabel>
                      <Select
                        name="Color"
                        value={formData.Color}
                        onChange={handleInputChange}
                        label="Color"
                        startAdornment={
                          <InputAdornment position="start">
                            <ColorLensIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {colors.map((color) => (
                          <MenuItem key={color} value={color}>{color}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Fuel Type*</InputLabel>
                      <Select
                        name="FuelType"
                        value={formData.FuelType}
                        onChange={handleInputChange}
                        label="Fuel Type"
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <LocalGasStationIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {fuelTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Transmission & CC */}
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Transmission Type*</InputLabel>
                      <Select
                        name="TransmissionType"
                        value={formData.TransmissionType}
                        onChange={handleInputChange}
                        label="Transmission Type"
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <SettingsIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {transmissionTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>CC</InputLabel>
                      <Select
                        name="CC"
                        value={formData.CC}
                        onChange={handleInputChange}
                        label="CC"
                      >
                        {ccOptions.map((cc) => (
                          <MenuItem key={cc} value={cc}>{cc} cc</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Location & Listed By */}
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Location</InputLabel>
                      <Select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        label="Location"
                        startAdornment={
                          <InputAdornment position="start">
                            <LocationOnIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {locations.map((loc) => (
                          <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth>
                      <InputLabel>Listed By</InputLabel>
                      <Select
                        name="listBy"
                        value={formData.listBy}
                        onChange={handleInputChange}
                        label="Listed By"
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {listByOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        mt: 2,
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #1565c0, #1976d2)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'all 0.5s',
                        },
                        '&:hover::after': {
                          left: '100%',
                        }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Predict Price'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </FormPaper>
          </Grid>

          {/* Result Column */}
          <Grid item xs={12} md={4}>
            <ResultCard>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {!loading && !price && (
                  <Fade in={true}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <TimelineIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Ready for Price Prediction
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fill in the form and press "Predict Price" to get an estimate of your vehicle's market value.
                      </Typography>
                      
                      <Box sx={{ mt: 4, mb: 2 }}>
                        <InfoChip
                          icon={<InfoIcon />}
                          label="Market-based pricing algorithm"
                          sx={{ mb: 1 }}
                        />
                        <InfoChip
                          icon={<InfoIcon />}
                          label="Uses real sales data"
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}

                {loading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h6">Calculating Price...</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Analyzing market data for your vehicle
                    </Typography>
                  </Box>
                )}

                {price && !loading && (
                  <Grow in={true} timeout={800}>
                    <Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        Predicted Market Value
                      </Typography>
                      
                      <PriceDisplay>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AttachMoneyIcon sx={{ fontSize: 32, mr: 1 }} />
                          <AnimatedValue variant="h4" fontWeight="bold">
                            {price.toLocaleString()} EGP
                          </AnimatedValue>
                        </Box>
                      </PriceDisplay>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Vehicle Summary:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {formData.Year} {formData.Make} {formData.Model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {formData.Kilometers} km • {formData.FuelType} • {formData.TransmissionType}
                        </Typography>
                      </Box>

                      {/* Market Insights */}
                      {showRecommendations && (
                        <Fade in={true}>
                          <Box sx={{ mt: 1 }}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Market Insights</Typography>
                              <Typography variant="body2">
                                {getMarketInsight(formData.Make, formData.Year, price)}
                              </Typography>
                            </Alert>
                            
                            <Button 
                              fullWidth
                              variant="outlined"
                              sx={{ mt: 1 }}
                              onClick={() => window.location.href = "/car-listing"}
                            >
                              List Your Car
                            </Button>
                          </Box>
                        </Fade>
                      )}
                    </Box>
                  </Grow>
                )}
              </CardContent>
            </ResultCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Helper function to generate market insights
function getMarketInsight(make, year, price) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(year);
  
  if (age <= 3) {
    return `Your ${make} is relatively new and in high demand. You could sell it quickly at this price.`;
  } else if (age <= 7) {
    return `This ${make} is in the mid-age range where good condition matters. Consider highlighting any recent maintenance.`;
  } else {
    return `Older vehicles like this ${make} can be harder to sell. Consider pricing slightly below market to attract more buyers.`;
  }
}

export default PricePrediction;
