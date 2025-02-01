import React, { useState } from 'react';
import ResponsiveAppBar from './NavBar';
import { Box, CircularProgress, Typography, Card, CardContent, CardMedia, Paper, List, ListItem, ListItemText, Collapse, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BuildIcon from '@mui/icons-material/Build';

const Input = styled('input')({
  display: 'none',
});

const UploadButton = styled('label')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [yoloResult, setYoloResult] = useState(null);
  const [expanded, setExpanded] = useState({});

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
  };

  const handleUpload = (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://127.0.0.1:8000/yolo/check_car', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setYoloResult(data);
        if (data.car_detected) {
          return fetch('http://127.0.0.1:8000/predict/predict', {
            method: 'POST',
            body: formData,
          });
        } else {
          throw new Error('No car detected in the image');
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const handleExpandClick = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const carDetails = {
    "2012 Hyundai Elantra Touring": {
      "Key Specs": {
        "Body Style": "4-door",
        "Seating Capacity": "5 seats",
        "Engine": "138.0-hp, 2.0-liter, 4 Cylinder Engine (Gasoline Fuel)",
        "MPG": "26 combined",
        "Dimensions": {
          "Length": "176.6\"",
          "Height": "59.8\""
        },
        "Drive Type": "Front Wheel Drive"
      },
      "Color Options": {
        "Exterior": [
          "Titanium Gray Metallic",
          "Atlantic Blue",
          "Volcanic Red",
          "Black Noir Pearl",
          "Chilipepper Red",
          "Monaco White",
          "Polar White",
          "Long Beach Blue",
          "Summit White"
        ],
        "Interior": [
          "Black",
          "Beige"
        ]
      },
      "Specifications": {
        "Engine": {
          "Type": "Gas I4",
          "Horsepower": "138 hp",
          "Torque": "136 lb-ft",
          "Displacement": "2.0L/121",
          "Transmission": "5-Speed M/T",
          "Cooling System Capacity": "3.2 qts"
        },
        "Brakes": {
          "ABS System": "4-wheel",
          "Front Brake Rotor": "11.8 x -TBD- in",
          "Rear Brake Rotor": "10.3 x -TBD- in",
          "Brake Type": "Pwr",
          "Disc - Front": "Yes",
          "Disc - Rear": "Yes"
        },
        "Electrical": {
          "Alternator Capacity": "90 amps",
          "Cold Cranking Amps": "550"
        },
        "Measurements": {
          "Passenger Capacity": "5",
          "Overall Height": "60 in",
          "Second Head Room": "39 in",
          "Min Ground Clearance": "6 in",
          "Cargo Volume to Seat 1": "65 ft³",
          "Cargo Volume to Seat 2": "24 ft³",
          "Front Head Room": "40 in",
          "Wheelbase": "106 in",
          "Passenger Volume": "101 ft³",
          "Front Shoulder Room": "55 in",
          "Front Hip Room": "54 in",
          "Second Hip Room": "53 in",
          "Second Shoulder Room": "55 in",
          "Front Leg Room": "44 in",
          "Track Width, Rear": "N/A"
        },
        "Safety": {
          "Stability Control": "Standard",
          "Brake Assist": "Standard"
        },
        "Steering": {
          "Lock to Lock Turns": "3",
          "Steering Ratio": "14:1",
          "Type": "Pwr Rack & Pinion",
          "Turning Diameter - Curb to Curb": "34 ft"
        },
        "Suspension": {
          "Front": "MacPherson Strut",
          "Rear": "Multi-Link"
        },
        "Tires & Wheels": {
          "Front Wheel Size": "15 x 5.5 in",
          "Rear Wheel Size": "15 x 5.5 in",
          "Spare Wheel Size": "Compact",
          "Front Tire Size": "P195/65R15",
          "Rear Tire Size": "P195/65R15",
          "Spare Tire Size": "Compact"
        },
        "Weight & Capacity": {
          "Base Curb Weight": "2,937 lbs",
          "Fuel Tank Capacity": "14 gal"
        }
      }
    }
  };

  const renderCarDetails = (details) => (
    <List>
      <ListItem>
        <DirectionsCarIcon />
        <ListItemText primary="Key Specs" />
        <IconButton onClick={() => handleExpandClick('keySpecs')}>
          {expanded.keySpecs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListItem>
      <Collapse in={expanded.keySpecs} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(details["Key Specs"]).map(([key, value]) => (
            <ListItem key={key} sx={{ pl: 4 }}>
              <ListItemText primary={`${key}: ${value}`} />
            </ListItem>
          ))}
        </List>
      </Collapse>
      <ListItem>
        <ColorLensIcon />
        <ListItemText primary="Color Options" />
        <IconButton onClick={() => handleExpandClick('colorOptions')}>
          {expanded.colorOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListItem>
      <Collapse in={expanded.colorOptions} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem sx={{ pl: 4 }}>
            <ListItemText primary="Exterior" />
          </ListItem>
          {details["Color Options"].Exterior.map((color) => (
            <ListItem key={color} sx={{ pl: 8 }}>
              <ListItemText primary={color} />
            </ListItem>
          ))}
          <ListItem sx={{ pl: 4 }}>
            <ListItemText primary="Interior" />
          </ListItem>
          {details["Color Options"].Interior.map((color) => (
            <ListItem key={color} sx={{ pl: 8 }}>
              <ListItemText primary={color} />
            </ListItem>
          ))}
        </List>
      </Collapse>
      <ListItem>
        <BuildIcon />
        <ListItemText primary="Specifications" />
        <IconButton onClick={() => handleExpandClick('specifications')}>
          {expanded.specifications ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListItem>
      <Collapse in={expanded.specifications} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(details.Specifications).map(([key, value]) => (
            <React.Fragment key={key}>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary={key} />
                <IconButton onClick={() => handleExpandClick(key)}>
                  {expanded[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </ListItem>
              <Collapse in={expanded[key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <ListItem key={subKey} sx={{ pl: 8 }}>
                      <ListItemText primary={`${subKey}: ${subValue}`} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Collapse>
    </List>
  );

  return (
    <div>
      <ResponsiveAppBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Input
          accept="image/*"
          id="upload-file"
          type="file"
          onChange={handleFileChange}
        />
        <UploadButton htmlFor="upload-file">
          {loading ? <CircularProgress size={24} /> : 'Choose File'}
        </UploadButton>
        {file && (
          <Paper elevation={3} sx={{ maxWidth: 345, mt: 4, p: 2, borderRadius: 2 }}>
            <CardMedia
              component="img"
              height="140"
              image={URL.createObjectURL(file)}
              alt="Uploaded car image"
              sx={{ borderRadius: 2 }}
            />
            <CardContent>
              {yoloResult && !yoloResult.car_detected && (
                <Typography variant="h6" color="error">
                  No car detected in the image.
                </Typography>
              )}
              {result && (
                <Box>
                  <Typography variant="h6">Make / Model Recognition</Typography>
                  <Typography variant="body1">Make: {result.prediction.split(' ')[0]}</Typography>
                  <Typography variant="body1">Model: {result.prediction.split(' ').slice(1, -1).join(' ')}</Typography>
                  <Typography variant="body1">Year: {result.prediction.split(' ').slice(-1)[0]}</Typography>
                  <Typography variant="body1">Probability: {result.probability}</Typography>
                  {result.prediction.includes("Hyundai Elantra Touring") && renderCarDetails(carDetails["2012 Hyundai Elantra Touring"])}
                </Box>
              )}
            </CardContent>
          </Paper>
        )}
      </Box>
    </div>
  );
}

export default Upload;
