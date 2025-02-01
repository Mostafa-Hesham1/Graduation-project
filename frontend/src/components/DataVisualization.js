import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line, Cell } from 'recharts';

const DataVisualization = () => {
  const [makeData, setMakeData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [makeSearchTerm, setMakeSearchTerm] = useState('');
  const [modelSearchTerm, setModelSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the make data from the backend
    const fetchMakeData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/make');
        const result = await response.json();
        setMakeData(result);
      } catch (error) {
        console.error('Failed to fetch make data:', error);
      }
    };

    // Fetch the model data from the backend
    const fetchModelData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/model');
        const result = await response.json();
        setModelData(result);
      } catch (error) {
        console.error('Failed to fetch model data:', error);
      }
    };

    // Fetch the fuel data from the backend
    const fetchFuelData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/fuel');
        const result = await response.json();
        setFuelData(result);
      } catch (error) {
        console.error('Failed to fetch fuel data:', error);
      }
    };

    // Fetch the yearly data from the backend
    const fetchYearlyData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data/yearly');
        const result = await response.json();
        setYearlyData(result.filter(item => item.Year >= 1999));
      } catch (error) {
        console.error('Failed to fetch yearly data:', error);
      }
    };

    fetchMakeData();
    fetchModelData();
    fetchFuelData();
    fetchYearlyData();
  }, []);

  const filteredMakeData = makeData.filter((row) =>
    row.Make.toLowerCase().includes(makeSearchTerm.toLowerCase())
  );

  const filteredModelData = modelData.filter((row) =>
    row.Model.toLowerCase().includes(modelSearchTerm.toLowerCase())
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const adjustedFuelData = fuelData.map((entry) => ({
    ...entry,
    Count: entry.Count < 5 ? entry.Count + 15 : entry.Count
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Visualization
      </Typography>
      <Grid container spacing={4} sx={{ width: '100%' }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Highest Make of Cars
            </Typography>
            <TextField
              label="Search Make"
              variant="outlined"
              value={makeSearchTerm}
              onChange={(e) => setMakeSearchTerm(e.target.value)}
              sx={{ mb: 2, width: '100%' }}
            />
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={filteredMakeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Make" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <TableContainer component={Paper} sx={{ mt: 2, border: '1px solid #ccc', maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Make</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMakeData.map((row) => (
                    <TableRow key={row.Make}>
                      <TableCell component="th" scope="row">
                        {row.Make}
                      </TableCell>
                      <TableCell align="right">{row.Count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Highest Model of Cars
            </Typography>
            <TextField
              label="Search Model"
              variant="outlined"
              value={modelSearchTerm}
              onChange={(e) => setModelSearchTerm(e.target.value)}
              sx={{ mb: 2, width: '100%' }}
            />
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={filteredModelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <TableContainer component={Paper} sx={{ mt: 2, border: '1px solid #ccc', maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredModelData.map((row) => (
                    <TableRow key={row.Model}>
                      <TableCell component="th" scope="row">
                        {row.Model}
                      </TableCell>
                      <TableCell align="right">{row.Count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Fuel Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={adjustedFuelData}
                  dataKey="Count"
                  nameKey="FuelType"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {adjustedFuelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', border: '1px solid #ccc' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Yearly Trends
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualization;
