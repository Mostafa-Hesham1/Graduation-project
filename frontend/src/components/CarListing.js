import React, { useState } from 'react';
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
} from '@mui/material';
import { uploadCarListing } from '../api'; // Assume this function is defined in your API file
import { ArrowForward, ArrowBack } from '@mui/icons-material'; // Import icons for navigation
import { useAuth } from '../context/AuthContext'; // Import your Auth context

// Makes and models data
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
  const { isAuthenticated } = useAuth(); // Get authentication state
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
    chatOption: 'chatOnly', // Default option
    price: '',
    images: [],
    description: '',
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [models, setModels] = useState([]);
  const navigate = useNavigate();

  // Redirect if not authenticated
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
      alert('You can upload a maximum of 5 images.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Construct the data object
        const dataToSubmit = {
            title: formData.title,
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year), // Ensure year is an integer
            bodyType: formData.bodyType,
            fuelType: formData.fuelType,
            cc: parseInt(formData.cc), // Ensure cc is an integer
            location: formData.location,
            kilometers: parseInt(formData.kilometers), // Ensure kilometers is an integer
            transmissionType: formData.transmissionType,
            color: formData.color,
            condition: formData.condition,
            chatOption: formData.chatOption,
            price: parseFloat(formData.price), // Ensure price is a float
            description: formData.description,
        };

        // Validate required fields
        const requiredFields = ['title', 'make', 'model', 'year', 'bodyType', 'fuelType', 'cc', 'location', 'kilometers', 'transmissionType', 'color', 'condition', 'chatOption', 'price'];
        for (const field of requiredFields) {
            if (!dataToSubmit[field]) {
                alert(`Please fill in the required field: ${field}`);
                return;
            }
        }

        // Create FormData for file uploads
        const carFormData = new FormData();
        for (const key in dataToSubmit) {
            carFormData.append(key, dataToSubmit[key]);
        }

        // Append images if they exist
        if (formData.images.length > 0) {
            formData.images.forEach((image) => {
                carFormData.append('images', image);
            });
        } else {
            alert('Please upload at least one image.');
            return;
        }

        // Call the API to upload the car listing
        await uploadCarListing(carFormData);
        navigate('/'); // Redirect after successful upload
    } catch (error) {
        console.error('Error uploading car listing:', error);
        alert('Failed to upload car listing: ' + (error.response?.data?.detail || 'Unknown error'));
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
    setCurrentImageIndex(0); // Reset to the first image after removal
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        List Your Car
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Images
            <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              border: '1px dashed gray',
              borderRadius: '4px',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              position: 'relative',
            }}
          >
            {formData.images.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handlePrevImage} disabled={currentImageIndex === 0}>
                  <ArrowBack />
                </IconButton>
                <Box sx={{ position: 'relative', margin: '0 10px' }}>
                  <img
                    src={URL.createObjectURL(formData.images[currentImageIndex])}
                    alt="Uploaded"
                    style={{ width: '200px', height: 'auto' }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(currentImageIndex)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'white',
                      borderRadius: '50%',
                      boxShadow: 1,
                      width: '20px',
                      height: '20px',
                      minWidth: '20px',
                      minHeight: '20px',
                    }}
                  >
                    <Typography variant="body2" color="error" sx={{ fontSize: '12px' }}>X</Typography>
                  </IconButton>
                </Box>
                <IconButton onClick={handleNextImage} disabled={currentImageIndex === formData.images.length - 1}>
                  <ArrowForward />
                </IconButton>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No images uploaded
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="title" label="Title" onChange={handleChange} required fullWidth margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required fullWidth margin="normal">
            <InputLabel>Make</InputLabel>
            <Select
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
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
          <FormControl required fullWidth margin="normal">
            <InputLabel>Model</InputLabel>
            <Select
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              disabled={!formData.make}
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
          <FormControl required fullWidth margin="normal">
            <InputLabel>Year</InputLabel>
            <Select name="year" onChange={handleChange}>
              {Array.from(new Array(new Date().getFullYear() - 1999 + 1), (val, index) => 1999 + index).map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required fullWidth margin="normal">
            <InputLabel>Body Type</InputLabel>
            <Select
              name="bodyType"
              value={formData.bodyType}
              onChange={handleChange}
              required
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
          <FormControl required fullWidth margin="normal">
            <InputLabel>Color</InputLabel>
            <Select
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
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
          <FormControl required fullWidth margin="normal">
            <InputLabel>Fuel Type</InputLabel>
            <Select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
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
          <TextField name="cc" label="CC" type="number" onChange={handleChange} required fullWidth margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required fullWidth margin="normal">
            <InputLabel>Location</InputLabel>
            <Select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
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
          <TextField name="kilometers" label="Kilometers" type="number" onChange={handleChange} required fullWidth margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required fullWidth margin="normal">
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              {conditionOptions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Transmission Type</InputLabel>
            <Select name="transmissionType" onChange={handleChange} required>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="automatic">Automatic</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="description"
            label="Description (Optional)"
            placeholder="Enter a description of the car"
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="price"
            label="Price"
            type="number"
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        List Car
      </Button>
    </Box>
  );
};

export default CarListing; 