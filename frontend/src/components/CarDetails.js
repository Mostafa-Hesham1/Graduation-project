import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { carSpecsData } from './carSpecs'; // Import car specifications data

const CarDetails = () => {
  return (
    <div>
      {carSpecsData.map((car, index) => (
        <Card key={index} sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {car.Title}
            </Typography>
            <Typography variant="h6">Key Specs:</Typography>
            {Object.entries(car["Key Specs"]).map(([key, value]) => {
              if (typeof value === 'object') {
                return (
                  <Typography key={key}>
                    {key}: Length: {value.Length}, Height: {value.Height}
                  </Typography>
                );
              }
              return <Typography key={key}>{key}: {value}</Typography>;
            })}
            <Typography variant="h6">Color Options:</Typography>
            <Typography>Exterior Colors: {car["Color Options"]["Exterior"].join(', ')}</Typography>
            <Typography>Interior Colors: {car["Color Options"]["Interior"].join(', ')}</Typography>
            <Typography variant="h6">Specifications:</Typography>
            {Object.entries(car.Specifications).map(([section, details]) => (
              <div key={section}>
                <Typography variant="subtitle1">{section.replace(/([A-Z])/g, ' $1').trim()}:</Typography>
                {typeof details === 'object' && !Array.isArray(details) ? (
                  Object.entries(details).map(([key, value]) => (
                    <Typography key={key}>{key}: {value}</Typography>
                  ))
                ) : <Typography>{details}</Typography>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CarDetails; 