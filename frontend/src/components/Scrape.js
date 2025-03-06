import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  CircularProgress,
  LinearProgress,
  Drawer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link as MuiLink,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// Utility to format seconds (e.g., "2m 30s")
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const Scrape = () => {
  // Fixed primary parameters for scraping (cannot be edited)
  const primaryParams = {
    main_url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=&fuel=&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=&dateMax=&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
    pages: 100,
    fuel_type: 'All',
    transmission_type: 'All'
  };

  // State for scraping process
  const [scrapeData, setScrapeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [abortController, setAbortController] = useState(null);
  const [error, setError] = useState(null);

  // Total expected time (assume 5 seconds per page)
  const totalExpectedTime = primaryParams.pages * 5;

  // Filter state (applied only to displayed data)
  const [filters, setFilters] = useState({
    make: 'All',
    model: 'All',
    year: 'All'
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update progress and estimated time while scraping
  useEffect(() => {
    let timer;
    if (loading) {
      let elapsed = 0;
      setEstimatedTime(totalExpectedTime);
      timer = setInterval(() => {
        elapsed += 1;
        setEstimatedTime(Math.max(totalExpectedTime - elapsed, 0));
        setProgress(Math.min((elapsed / totalExpectedTime) * 100, 100));
      }, 1000);
    } else {
      setProgress(100);
    }
    return () => clearInterval(timer);
  }, [loading, totalExpectedTime]);

  // Handle scraping (using fixed primary parameters and the full old URL set)
  const handleScrape = async () => {
    setLoading(true);
    setScrapeData([]);
    setProgress(0);
    setEstimatedTime(totalExpectedTime);
    setError(null);
    try {
      const urls = [
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=2&fuel=1&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 565,
          fuel_type: 'Gas',
          transmission_type: 'Automatic'
        },
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=1&fuel=1&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 200,
          fuel_type: 'Gas',
          transmission_type: 'Manual'
        },
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=1&fuel=2&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 7,
          fuel_type: 'Diesel',
          transmission_type: 'Manual'
        },
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=2&fuel=2&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 3,
          fuel_type: 'Diesel',
          transmission_type: 'Automatic'
        },
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=0&fuel=4&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 3,
          fuel_type: 'Electric',
          transmission_type: 'Automatic'
        },
        {
          url: 'https://eg.hatla2ee.com/en/car/search?make=&model=0&city=0&body=&transmission=0&fuel=10&priceMin=&priceMax=&kmMin=&kmMax=&dateMin=0&dateMax=0&color=&accountMin=&accountMax=&installmentMin=&installmentMax=',
          pages: 3,
          fuel_type: 'Hybrid',
          transmission_type: 'Automatic'
        }
      ];

      const results = await Promise.all(
        urls.map(({ url, pages, fuel_type, transmission_type }) =>
          fetch('http://localhost:8000/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ main_url: url, pages: pages, fuel_type: fuel_type, transmission_type: transmission_type })
          }).then(response => response.json())
        )
      );
      const combinedData = results.flatMap(result => result.data);
      setScrapeData(combinedData);
      setCsvFilePath(results.find(result => result.csv_file_path)?.csv_file_path);
    } catch (err) {
      console.error('Scrape error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  // Stop scraping
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
    }
  };

  // Toggle filter drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle filter changes (for displayed data only)
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters to the scraped data
  const filteredData = scrapeData.filter(item => {
    const matchMake = filters.make === 'All' || (item.Make && item.Make.toLowerCase() === filters.make.toLowerCase());
    const matchModel = filters.model === 'All' || (item.Model && item.Model.toLowerCase() === filters.model.toLowerCase());
    const matchYear = filters.year === 'All' || (item.Year && item.Year === filters.year);
    return matchMake && matchModel && matchYear;
  });

  // Only show first 6 items
  const displayData = filteredData.slice(0, 6);

  const dataVisualization = [
    { name: 'Total Records', value: scrapeData.length }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with filter drawer toggle */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Car Data Scraper</Typography>
        <IconButton onClick={toggleDrawer} color="primary">
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Filter Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 300, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <FormControl fullWidth margin="normal">
            <InputLabel id="make-label">Make</InputLabel>
            <Select
              labelId="make-label"
              value={filters.make}
              label="Make"
              onChange={(e) => handleFilterChange('make', e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Toyota">Toyota</MenuItem>
              <MenuItem value="BMW">BMW</MenuItem>
              <MenuItem value="Mercedes">Mercedes</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              labelId="model-label"
              value={filters.model}
              label="Model"
              onChange={(e) => handleFilterChange('model', e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Corolla">Corolla</MenuItem>
              <MenuItem value="3 Series">3 Series</MenuItem>
              <MenuItem value="C-Class">C-Class</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              labelId="year-label"
              value={filters.year}
              label="Year"
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="2020">2020</MenuItem>
              <MenuItem value="2019">2019</MenuItem>
              <MenuItem value="2018">2018</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Drawer>

      {/* Scraping Controls */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {!loading ? (
              <Button variant="contained" color="primary" onClick={handleScrape}>
                Scrape Data
              </Button>
            ) : (
              <Button variant="contained" color="error" onClick={handleStop}>
                Stop Scraper
              </Button>
            )}
          </Grid>
          {loading && (
            <Grid item xs>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Progress: {progress.toFixed(0)}% — Estimated time remaining: {formatTime(estimatedTime)}
              </Typography>
            </Grid>
          )}
        </Grid>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
      </Paper>

      {/* Data Display */}
      <Typography variant="h5" gutterBottom>
        Scraped Data ({filteredData.length} items)
      </Typography>
      {loading && scrapeData.length === 0 ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredData.length > 0 ? (
        <Grid container spacing={2}>
          {displayData.map((car, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6">
                  {car.Name || 'Unknown Vehicle'}
                </Typography>
                <Typography>Make: {car.Make || 'N/A'}</Typography>
                <Typography>Model: {car.Model || 'N/A'}</Typography>
                <Typography>Year: {car.Year || 'N/A'}</Typography>
                <Typography>Price: {car.Price || 'N/A'}</Typography>
                <Typography>Fuel: {car['Fuel Type'] || 'N/A'}</Typography>
                <Typography>Transmission: {car['Transmission Type'] || 'N/A'}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No data available. Click "Scrape Data" to start scraping.</Typography>
      )}

      {/* CSV Download Button */}
      {scrapeData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <MuiLink href="http://localhost:8000/scrape/download_csv" download="scraped_data.csv" underline="none">
            <Button variant="contained" color="secondary">
              Download CSV
            </Button>
          </MuiLink>
        </Box>
      )}
    </Container>
  );
};

export default Scrape;
