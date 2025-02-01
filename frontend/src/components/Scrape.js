import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Container, Typography, Box, Link as MuiLink, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Scrape() {
  const [scrapeData, setScrapeData] = useState([]);
  const [randomData, setRandomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csvFilePath, setCsvFilePath] = useState(null);
  const lastScrapedDate = '1/8/2024';

  useEffect(() => {
    // Fetch all data from the CSV file
    const fetchAllData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/all');
        const result = await response.json();
        setScrapeData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Failed to fetch all data:', error);
        setScrapeData([]);
      }
    };

    // Fetch random data from the CSV file
    const fetchRandomData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/random');
        const result = await response.json();
        setRandomData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Failed to fetch random data:', error);
        setRandomData([]);
      }
    };

    fetchAllData();
    fetchRandomData();
  }, []);

  const handleScrape = () => {
    setLoading(true);
    const urls = [
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=2&fuel=1&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 565, fuel_type: 'Gas', transmission_type: 'Automatic' },
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=1&fuel=1&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 200, fuel_type: 'Gas', transmission_type: 'Manual' },
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=1&fuel=2&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 7, fuel_type: 'Diesel', transmission_type: 'Manual' },
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=2&fuel=2&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 3, fuel_type: 'Diesel', transmission_type: 'Automatic' },
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=0&fuel=4&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 3, fuel_type: 'Electric', transmission_type: 'Automatic' },
      { url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=0&fuel=10&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=', pages: 3, fuel_type: 'Hybrid', transmission_type: 'Automatic' },
    ];

    Promise.all(urls.map(({ url, pages, fuel_type, transmission_type }) =>
      fetch('http://127.0.0.1:8000/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ main_url: url, pages: pages, fuel_type: fuel_type, transmission_type: transmission_type }),
      }).then(response => response.json())
    ))
      .then(results => {
        const combinedData = results.flatMap(result => result.data);
        setScrapeData(combinedData);
        setCsvFilePath(results.find(result => result.csv_file_path)?.csv_file_path);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const dataVisualization = [
    { name: 'Total Records', value: scrapeData.length },
  ];

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Button variant="contained" onClick={handleScrape} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Run Scraper'}
        </Button>
        <Typography variant="h6" sx={{ mt: 2 }}>Total items scraped: {scrapeData.length}</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>Last Scraped Date: {lastScrapedDate}</Typography>
        <Grid container spacing={4} sx={{ width: '100%', mt: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Scraped Data Visualization
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dataVisualization} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Random Data from CSV
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Make</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Year</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Kilometers</TableCell>
                      <TableCell>Fuel Type</TableCell>
                      <TableCell>Transmission</TableCell>
                      <TableCell>Body Type</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>CC</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>List By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrapeData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.Make || 'N/A'}</TableCell>
                        <TableCell>{row.Model || 'N/A'}</TableCell>
                        <TableCell>{row.Year || 'N/A'}</TableCell>
                        <TableCell>{row.Price || 'N/A'}</TableCell>
                        <TableCell>{row.Kilometers || 'N/A'}</TableCell>
                        <TableCell>{row.FuelType || 'N/A'}</TableCell>
                        <TableCell>{row.Transmission || 'N/A'}</TableCell>
                        <TableCell>{row.BodyType || 'N/A'}</TableCell>
                        <TableCell>{row.Color || 'N/A'}</TableCell>
                        <TableCell>{row.CC || 'N/A'}</TableCell>
                        <TableCell>{row.Location || 'N/A'}</TableCell>
                        <TableCell>{row.ListBy || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
        {csvFilePath && (
          <MuiLink href={`http://127.0.0.1:8000/scrape/download_csv`} download="scraped_data.csv">
            <Button variant="contained" sx={{ mt: 2 }}>Download CSV</Button>
          </MuiLink>
        )}
      </Box>
    </Container>
  );
}

export default Scrape;