import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Weather.css';

function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState('metric'); // "metric" or "imperial"
  const [unitLabel, setUnitLabel] = useState('°C');
  // Track last search mode
  const lastMode = useRef({ type: null, data: null });

  // Helper to fetch weather & forecast by CITY
  const getWeatherByCity = async (cityName, usedUnits = units) => {
    setError('');
    setWeather(null);
    setForecast([]);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/weather?city=${cityName}&units=${usedUnits}`);
      setWeather(res.data);

      // Get forecast for 5 days
      const fRes = await axios.get(`http://localhost:5001/forecast?city=${cityName}&units=${usedUnits}`);
      // Pick 12:00 noon for each day (one every 8 samples of 3h)
      const dailySummaries = [];
      let prevDay = null;
      fRes.data.list.forEach(w => {
        const dt = new Date(w.dt * 1000);
        if (dt.getHours() === 12 && dt.getDate() !== prevDay) {
          dailySummaries.push({
            dt_txt: w.dt_txt,
            main: w.main,
            weather: w.weather,
          });
          prevDay = dt.getDate();
        }
      });
      setForecast(dailySummaries.slice(0, 5));
      // Remember search mode
      lastMode.current = { type: 'city', data: cityName };
    } catch (error) {
      setError('Could not fetch weather data for that city.');
    }
    setLoading(false);
  };

  // Helper to fetch weather & forecast by coords (lat, lon)
  const getWeatherByCoords = async (lat, lon, usedUnits = units) => {
    setError('');
    setWeather(null);
    setForecast([]);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/weather/coords?lat=${lat}&lon=${lon}&units=${usedUnits}`);
      setWeather(res.data);
      setCity(res.data.name);

      // Use the returned coordinates for the forecast as well!
      // OpenWeatherMap forecast endpoint can also take lat/lon:
      const fRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=YOUR_OPENWEATHERMAP_API_KEY&units=${usedUnits}`);
      const dailySummaries = [];
      let prevDay = null;
      fRes.data.list.forEach(w => {
        const dt = new Date(w.dt * 1000);
        if (dt.getHours() === 12 && dt.getDate() !== prevDay) {
          dailySummaries.push({
            dt_txt: w.dt_txt,
            main: w.main,
            weather: w.weather,
          });
          prevDay = dt.getDate();
        }
      });
      setForecast(dailySummaries.slice(0, 5));
      // Remember search mode
      lastMode.current = { type: 'coords', data: { lat, lon } };
    } catch (error) {
      setError('Could not fetch weather for your location.');
    }
    setLoading(false);
  };

  // Called on button click for city
  const fetchWeather = async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }
    await getWeatherByCity(city);
  };

  // Called on geo button click
  const fetchWeatherByCoords = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported in your browser');
    } else {
      setError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Location access denied.');
        }
      );
    }
  };

  // Called on °C/°F toggle
  const handleUnitsToggle = () => {
    const nextUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(nextUnits);
    setUnitLabel(nextUnits === 'metric' ? '°C' : '°F');
    // Re-fetch using the most recent city/coords
    if (lastMode.current.type === 'city' && lastMode.current.data) {
      getWeatherByCity(lastMode.current.data, nextUnits);
    } else if (lastMode.current.type === 'coords' && lastMode.current.data) {
      getWeatherByCoords(lastMode.current.data.lat, lastMode.current.data.lon, nextUnits);
    }
  };

  return (
    <div className="weather-bg">
      <div className="weather-container">
        <h2 className="weather-title">Get Current Weather</h2>
        <div className="weather-form">
          <input
            className="weather-input"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter city name"
            autoFocus
          />
          <button className="weather-btn" onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </div>
        <div className="row-buttons">
          <button className="weather-btn small-btn" type="button" onClick={fetchWeatherByCoords}>
            Get My Location Weather
          </button>
          <button className="weather-btn small-btn" type="button" onClick={handleUnitsToggle}>
            {units === 'metric' ? 'Show °F' : 'Show °C'}
          </button>
        </div>
        {error && <div className="weather-error">{error}</div>}
        {loading && <div className="loader"></div>}
        {weather && (
          <div className="weather-info">
            <h3>{weather.name}</h3>
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="weather-icon"
            />
            <p className="desc">{weather.weather[0].description}</p>
            <div className="weather-details">
              <span>🌡️ {weather.main.temp} {unitLabel}</span>
              <span>😷 {weather.main.feels_like} {unitLabel} feels like</span>
              <span>💧 {weather.main.humidity}% Humidity</span>
              <span>🌬️ {weather.wind.speed} {units === 'metric' ? 'm/s' : 'mph'} Wind</span>
              <span>🔽 {weather.main.pressure} hPa</span>
              <span>🌁 {Math.round(weather.visibility / 1000)} km Visibility</span>
            </div>
            <div className="extras">
              <span>🌅 Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span>🌇 Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        )}
        {forecast.length > 0 && (
          <div className="forecast-strip">
            {forecast.map((day, idx) => {
              const dateObj = new Date(day.dt_txt);
              const label = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'});
              return (
                <div className="forecast-day" key={idx}>
                  <div className="forecast-date">{label}</div>
                  <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt={day.weather[0].main} className="forecast-icon"/>
                  <div className="forecast-main">{Math.round(day.main.temp)}{unitLabel}</div>
                  <div className="forecast-desc">{day.weather[0].main}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default Weather;
