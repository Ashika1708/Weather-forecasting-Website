const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const apiKey = '40cf0c2e373006bbeda24e502e5ef7bd';  

// Get current weather by city name
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  const units = req.query.units || 'metric';
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get current weather by geographic coordinates
app.get('/weather/coords', async (req, res) => {
  const { lat, lon, units } = req.query;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units || 'metric'}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather by coords:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather by coordinates' });
  }
});

// Get 5-day forecast by city name
app.get('/forecast', async (req, res) => {
  const city = req.query.city;
  const units = req.query.units || 'metric';
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

app.get('/forecast/coords', async (req, res) => {
  const { lat, lon, units } = req.query;
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units || 'metric'}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast by coords:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast for coordinates' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
