import React, { useState } from 'react';
import { Box, Button, Typography, Grid, Paper, MenuItem, Select, InputLabel, FormControl, TextField } from '@mui/material';

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

const fuelTypes = ["Benzine", "Diesel", "Electric", "Hybrid", "Natural Gas"];
const ccOptions = ["1000", "1200", "1400", "1500", "1600", "1800", "2000", "2200","2400", "2500", "3000", "3500", "4000", "4500", "5000"];
const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gray", "Yellow", "Orange", "Purple", "Brown", "Gold", "Pink"];
const listByOptions = ["dealership", "individual"];
const locationOptions = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"];
const transmissionOptions = ["Automatic", "Manual"];

// Generate year options from 1999 to the current year
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(new Array(currentYear - 1999 + 1), (val, index) => 1999 + index);

const bodyTypeOptions = [
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

const PricePrediction = () => {
  const [formData, setFormData] = useState({
    Make: '',
    Model: '',
    BodyType: '',
    Color: '',
    Kilometers: '',
    Year: '',
    FuelType: '',
    TransmissionType: '',
    CC: '',
    location: '',
    listBy: ''
  });

  const [predictedPrice, setPredictedPrice] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/price/predict_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPredictedPrice(data.predicted_price);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  // Disable validation for testing purposes
  const isFormValid = () => {
    return true;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Car Price Prediction
      </Typography>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Make</InputLabel>
                <Select
                  name="Make"
                  value={formData.Make}
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Model</InputLabel>
                <Select
                  name="Model"
                  value={formData.Model}
                  onChange={handleChange}
                  required
                  disabled={!formData.Make}
                >
                  {formData.Make && carData[formData.Make].map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="FuelType"
                  value={formData.FuelType}
                  onChange={handleChange}
                  required
                >
                  {fuelTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>CC</InputLabel>
                <Select
                  name="CC"
                  value={formData.CC}
                  onChange={handleChange}
                  required
                >
                  {ccOptions.map((cc) => (
                    <MenuItem key={cc} value={cc}>
                      {cc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Color</InputLabel>
                <Select
                  name="Color"
                  value={formData.Color}
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
              <FormControl fullWidth margin="normal">
                <InputLabel>List By</InputLabel>
                <Select
                  name="listBy"
                  value={formData.listBy}
                  onChange={handleChange}
                  required
                >
                  {listByOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Year</InputLabel>
                <Select
                  name="Year"
                  value={formData.Year}
                  onChange={handleChange}
                  required
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transmission Type</InputLabel>
                <Select
                  name="TransmissionType"
                  value={formData.TransmissionType}
                  onChange={handleChange}
                  required
                >
                  {transmissionOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="Kilometers"
                label="Kilometers"
                value={formData.Kilometers}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Body Type</InputLabel>
                <Select
                  name="BodyType"
                  value={formData.BodyType}
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
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={!isFormValid()}>
              Predict Price
            </Button>
          </Box>
        </form>
        {predictedPrice && (
          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2, textAlign: 'center' }}>
            Predicted Price: EGP {predictedPrice.toFixed(2)}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default PricePrediction;
