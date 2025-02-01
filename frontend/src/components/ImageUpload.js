import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Grid, Paper, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress, Card, CardContent, styled, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { carSpecsData } from './carSpecs'; // Import car specifications data
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import icon for accordion
import { styled as muiStyled } from '@mui/material/styles';

const fuelTypes = ["Benzine", "Diesel", "Electric", "Hybrid", "Natural Gas"];
const ccOptions = ["1000", "1200", "1400", "1500", "1600", "1800", "2000", "2200","2400", "2500", "3000", "3500", "4000", "4500", "5000"];
const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gray", "Yellow", "Orange", "Purple", "Brown", "Gold", "Pink"];
const listByOptions = ["dealership", "individual"];
const locationOptions = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"];
const transmissionOptions = ["Automatic", "Manual"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(new Array(currentYear - 1999 + 1), (val, index) => 1999 + index);

// Define a styled component for the specifications card
const SpecsCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5', // Change background color
}));

const SpecItem = styled(Box)(({ theme, isEven }) => ({
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: theme.spacing(1),
  margin: theme.spacing(1, 0),
  backgroundColor: isEven ? '#e8f0fe' : '#ffffff', // Alternating row colors
}));

// Define a styled component for the upload button
const StyledUploadButton = styled(Button)(({ theme }) => ({
  width: 'auto', // Set width to auto for normal size
  height: '40px', // Set a normal height
  fontSize: '1rem', // Set a normal font size
  marginBottom: theme.spacing(2), // Add margin below the button
}));

// Define a styled component for the image gallery
const ImageGallery = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  border: '2px solid #ccc', // Border around the gallery
  borderRadius: '8px',
  padding: theme.spacing(2),
  backgroundColor: '#fff', // White background for the gallery
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
}));

const ImageUpload = () => {
  const [carDetails, setCarDetails] = useState(null); // State to hold car details
  const [carName, setCarName] = useState(''); // State to hold car name
  const [showColorTable, setShowColorTable] = useState(false); // State to toggle color table visibility
  const [loading, setLoading] = useState(false); // State to manage loading
  const [formData, setFormData] = useState({}); // State to hold form data
  const [predictedPrice, setPredictedPrice] = useState(null); // State to hold predicted price
  const [uploadedImage, setUploadedImage] = useState(null); // State to hold the uploaded image

  // Function to normalize color names
  const normalizeColor = (color) => {
    const colorMap = {
      "titanium gray metallic": "Gray",
      "atlantic blue": "Blue",
      // Add more mappings as needed
    };
    return colorMap[color.toLowerCase()] || color; // Return mapped color or original
  };

  const handleImageChange = async (formData) => {
    setLoading(true);
    setUploadedImage(URL.createObjectURL(formData.get('file'))); // Display the uploaded image

    try {
      const yoloResponse = await axios.post('http://localhost:8000/yolo/check_car', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (yoloResponse.data.car_detected) {
        const response = await axios.post('http://localhost:8000/predict/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const prediction = response.data.prediction.trim();
        const words = prediction.split(' ');

        // Set the car name immediately after identification
        setCarName(prediction); // Set the car name here

        // Set default values based on the identified car
        let fuelType = '';
        let cc = '';
        let transmissionType = '';

        if (prediction === "Hyundai Sonata Sedan 2012") {
          fuelType = 'Benzine'; // Set default FuelType for Hyundai Sonata Sedan 2012
          cc = '2400'; // Set default CC for Hyundai Sonata Sedan 2012
          transmissionType = 'Automatic'; // Set default TransmissionType for Hyundai Sonata Sedan 2012
        } else if (prediction === "BMW M5 Sedan 2010") {
          fuelType = 'Benzine'; // Set default FuelType for BMW M5 Sedan 2010
          cc = '5000'; // Set default CC for BMW M5 Sedan 2010
          transmissionType = 'Automatic'; // Set default TransmissionType for BMW M5 Sedan 2010
        } else if (prediction === "BMW X3 SUV 2012") {
          fuelType = 'Benzine'; // Set default FuelType for BMW X3 SUV 2012
          cc = '2000'; // Set default CC for BMW X3 SUV 2012
          transmissionType = 'Automatic'; // Set default TransmissionType for BMW X3 SUV 2012
        } else if (prediction === "Hyundai Accent Sedan 2012") {
          fuelType = 'Benzine'; // Set default FuelType for Hyundai Accent Sedan 2012
          cc = '1600'; // Set default CC for Hyundai Accent Sedan 2012
          transmissionType = 'Automatic'; // Set default TransmissionType for Hyundai Accent Sedan 2012
        }else if (prediction === "Hyundai Elantra Touring Hatchback 2012") {
            fuelType = 'Benzine'; // Set default FuelType for Hyundai Accent Sedan 2012
            cc = '1600'; // Set default CC for Hyundai Accent Sedan 2012
            transmissionType = 'Automatic'; // Set default TransmissionType for Hyundai Accent Sedan 2012
        }else if (prediction === "BMW X6 SUV 2012") {
            fuelType = 'Benzine'; // Set default FuelType for BMW X3 SUV 2012
            cc = '3000'; // Set default CC for BMW X3 SUV 2012
            transmissionType = 'Automatic'; // Set default TransmissionType for BMW X3 SUV 2012
        }
        // Assign values based on the number of words
        if (words.length === 4) {
          setFormData({
            Make: words[0], // First word is Make
            Model: words[1], // Second word is Model
            BodyType: words[2], // Third word is Body Type
            Year: words[3], // Fourth word is Year
            FuelType: fuelType, // Set FuelType
            CC: cc, // Set CC
            TransmissionType: transmissionType // Set TransmissionType
          });
        } else if (words.length > 4) {
          setFormData({
            Make: words[0], // First word is Make
            Model: words.slice(1, 3).join(' '), // Join the second and third words for Model
            BodyType: words[3], // Fourth word is Body Type
            Year: words[words.length - 1], // Last word is Year
            FuelType: fuelType, // Set FuelType
            CC: cc, // Set CC
            TransmissionType: transmissionType // Set TransmissionType
          });
        }

        // Find the identified car in the stored car specifications
        const foundCar = carSpecsData.find(car => car.Title.toLowerCase() === prediction.toLowerCase());
        if (foundCar) {
          setCarDetails(foundCar); // Set car details if found
        } else {
          setCarDetails(null); // Reset car details if not found
        }
      } else {
        throw new Error('No car detected in the image');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePricePrediction = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const response = await axios.post('http://127.0.0.1:8000/price/predict_price', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setPredictedPrice(response.data.predicted_price);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  const handlePredefinedImageClick = async (image) => {
    const response = await fetch(image);
    const blob = await response.blob();
    const file = new File([blob], 'car.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append("file", file);
    await handleImageChange(formData); // Call the image change handler
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first file
    if (file) {
      const formData = new FormData(); // Create a new FormData object
      formData.append('file', file); // Append the file to the FormData
      handleImageChange(formData); // Call the existing image change handler
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0, p: 0 }}>
      {/* Title for the section */}
      <Box sx={{
        width: '100vw',
        height: '25vh',
        backgroundImage: 'url(/CAR-BG.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 0,
        margin: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9, // Adjust opacity for darker effect
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        top: 0,
      }}>
        <Typography variant="h5" component="h2">Upload Your Car Image</Typography>
      </Box>

      {/* Centering the Upload Image Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
      </Box>

      {/* Image Gallery Section */}
      <Box sx={{ mt: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Click on one of the following example images
        </Typography>
        <ImageGallery>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={4} sm={2}>
              <img src="/car1.jpg" alt="Car 1" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car1.jpg')} />
            </Grid>
            <Grid item xs={4} sm={2}>
              <img src="/car2222.jpg" alt="Car 2" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car2222.jpg')} />
            </Grid>
            <Grid item xs={4} sm={2}>
              <img src="/car3.jpg" alt="Car 3" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car3.jpg')} />
            </Grid>
            <Grid item xs={4} sm={2}>
              <img src="/car4.jpg" alt="Car 4" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car4.jpg')} />
            </Grid>
            <Grid item xs={4} sm={2}>
              <img src="/car5555555.jpeg" alt="Car 5" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car5555555.jpeg')} />
            </Grid>
            <Grid item xs={4} sm={2}>
              <img src="/car6.jpeg" alt="Car 6" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} onClick={() => handlePredefinedImageClick('/car6.jpeg')} />
            </Grid>
          </Grid>
        </ImageGallery>
      </Box>

      {/* Display the uploaded image */}
      {uploadedImage && (
        <Box sx={{ mt: 2, border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '600px' }}>
          <img src={uploadedImage} alt="Uploaded" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      )}

      {/* Show loading indicator */}
      {loading && (
        <CircularProgress sx={{ mt: 2 }} />
      )}

      {carName && (
        <Typography variant="h6" component="h2" gutterBottom>
          Car Identified: {carName} {/* Display the identified car name */}
        </Typography>
      )}
      {carName && (
        <form onSubmit={handlePricePrediction}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="Make"
                label="Make"
                value={formData.Make}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="Model"
                label="Model"
                value={formData.Model}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="BodyType"
                label="Body Type"
                value={formData.BodyType}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="Year"
                label="Year"
                value={formData.Year}
                onChange={handleFormChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="FuelType"
                  value={formData.FuelType}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                <InputLabel>Transmission Type</InputLabel>
                <Select
                  name="TransmissionType"
                  value={formData.TransmissionType}
                  onChange={handleFormChange}
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
                onChange={handleFormChange}
                margin="normal"
                fullWidth
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" sx={{ width: 'auto', height: '40px', fontSize: '1rem' }}>
              Predict Price
            </Button>
          </Box>

          {predictedPrice && (
            <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2, textAlign: 'center' }}>
              Predicted Price: EGP {predictedPrice.toLocaleString()}
            </Typography>
          )}
        </form>
      )}
      
      {carDetails && (
        <SpecsCard sx={{ mt: 4, width: '100%' }}>
          <CardContent>
            {carDetails.Title && (
              <SpecItem style={{ backgroundColor: 'white' }}>
                <Typography>Title: {carDetails.Title}</Typography>
              </SpecItem>
            )}
            {/* Display Key Specs in a Table */}
            {carDetails["Key Specs"] && (
              <SpecItem style={{ backgroundColor: 'white' }}>
                <Typography variant="h6">Key Specifications:</Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Specification</th>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Body Style</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Key Specs"]["Body Style"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Seating Capacity</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Key Specs"]["Seating Capacity"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Engine</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Key Specs"]["Engine"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>MPG</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Key Specs"]["MPG"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Dimensions</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                        {carDetails["Key Specs"]["Dimensions"] ? 
                          `Length: ${carDetails["Key Specs"]["Dimensions"]["Length"]}, Height: ${carDetails["Key Specs"]["Dimensions"]["Height"]}` : 
                          'N/A'}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Drive Type</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Key Specs"]["Drive Type"] || 'N/A'}</td>
                    </tr>
                    {/* Display additional details */}
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>CC</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{formData.CC || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Transmission Type</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{formData.TransmissionType || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Fuel Type</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{formData.FuelType || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </SpecItem>
            )}
            {/* Display Color Options */}
            {carDetails["Color Options"] && (
              <SpecItem isEven={true} sx={{ backgroundColor: '#fff' }}>
                <Typography variant="h6">Color Options:</Typography>
                <Typography variant="subtitle1">Exterior:</Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carDetails["Color Options"]["Exterior"].map((color, index) => (
                      <tr key={color} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f0f0f0' }}>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          <span style={{ color }}>{color}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Typography variant="subtitle1">Interior:</Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carDetails["Color Options"]["Interior"].map((color, index) => (
                      <tr key={color} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f0f0f0' }}>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          <span style={{ color }}>{color}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SpecItem>
            )}
            {/* Display Full Specifications */}
            {carDetails["Specifications"] && (
              <SpecItem sx={{ backgroundColor: '#fff' }}>
                <Typography variant="h6">Full Specifications:</Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Specification</th>
                      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Engine Type</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Type"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Horsepower</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Horsepower"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Torque</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Torque"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Displacement</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Displacement"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Transmission</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Transmission"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Cooling System Capacity</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Engine"]["Cooling System Capacity"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>ABS System</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Brakes"]["ABS System"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Passenger Capacity</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Measurements"]["Passenger Capacity"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Overall Height</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Measurements"]["Overall Height"] || 'N/A'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>Base Curb Weight</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{carDetails["Specifications"]["Weight & Capacity"]["Base Curb Weight"] || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </SpecItem>
            )}
          </CardContent>
        </SpecsCard>
      )}
    </Box>
  );
};

export default ImageUpload;
