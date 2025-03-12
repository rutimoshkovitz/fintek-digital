import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import logo from "./assets/logo.png";
import './customWeather.css';

const CustomWeather = () => {
  // State to manage weather data and UI elements
  const [data, setData] = useState({
    cityName: "",
    weatherInfo: null,
    errorMessage: "",
    isLoading: false,
    cityList: [],
    hourlyData: [],
    showSuggestions: false,
  });
  const { cityName, weatherInfo, errorMessage, isLoading, cityList, hourlyData, showSuggestions } = data;

  // Get current hour from weather data
  const currentLocalTime = weatherInfo ? weatherInfo.location.localtime.split(" ")[1] : null;
  const currentHour = currentLocalTime ? Number(currentLocalTime.split(":")[0]) : null;
  const startHour = currentHour ? currentHour - 3 : null;
  const endHour = currentHour ? currentHour + 1 : null;

  // Filter the hourly forecast based on the current time
  const filteredHourlyData = hourlyData.length > 0
    ? hourlyData.filter(hour => {
      const hourTime = Number(hour.time.split(" ")[1].split(":")[0]);
      return hourTime >= startHour && hourTime <= endHour;
    })
    : [];

  // Fetch list of cities from the backend
  useEffect(() => {
    async function getCities() {
      try {
        const response = await axios.get("http://localhost:4040/api/weather/cities");
        const cities = response.data;
        if (cities?.places) {
          setData((prevData) => ({
            ...prevData,
            cityList: cities.places.map((city) => ({ title: city })),
          }));
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }
    getCities();
  }, []);

  // Fetch weather data for the selected city
  const fetchWeatherData = useCallback(async () => {
    if (!cityName) {
      setData((prevData) => ({ ...prevData, errorMessage: "Please enter city name" }));
      return;
    }
    try {
      setData((prevData) => ({ ...prevData, errorMessage: "", isLoading: true }));
      const result = await axios.get(`http://localhost:4040/api/weather?location=${cityName}`);
      setData((prevData) => ({
        ...prevData,
        weatherInfo: result.data,
        hourlyData: result.data.forecast.forecastday[0].hour, // fixed 'hourlyForecast' to 'hourlyData'
      }));
    } catch (err) {
      setData((prevData) => ({ ...prevData, errorMessage: "Could not fetch weather data", weatherInfo: null }));
    } finally {
      setData((prevData) => ({ ...prevData, isLoading: false, cityName: "" }));
    }
  }, [cityName]);

  // Handle city selection from suggestions
  const selectCity = (selectedCity) => {
    setData((prevData) => ({
      ...prevData,
      cityName: selectedCity,
      showSuggestions: false,
    }));
  };

  // Filter the cities based on the user input
  const filteredCityList = cityList.filter((c) => c.title.toLowerCase().includes(cityName.toLowerCase())); // changed 'name' to 'title'

  return (
    <div className="custom-container">
      <div className="left-section">
        <img src={logo} className="logoImg" />
        <h1 className="main-title">Use our weather app to see the weather around the world</h1>
        <div className="input-wrapper">
          <TextField
            id="outlined-basic"
            label="Enter City"
            variant="outlined"
            value={cityName}
            onChange={(e) => {
              setData((prevData) => ({ ...prevData, cityName: e.target.value, showSuggestions: true }));
            }}
            className="city-input"
          />
          <Button onClick={fetchWeatherData} className="submit-button" disabled={isLoading}>
            {isLoading ? <span className="loading-spinner"></span> : "Check"}
          </Button>
          {showSuggestions && cityName && filteredCityList.length > 0 && (
            <ul className="city-list">
              {filteredCityList.slice(0, 5).map((c, index) => (
                <li key={index} onClick={() => selectCity(c.title)}>
                  {c.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {weatherInfo ? (
          <div className="city-info">
            <h3>Latitude: {weatherInfo.location.lat}, Longitude: {weatherInfo.location.lon}</h3>
            <h3>Accurate {weatherInfo.location.localtime}</h3>
          </div>
        ) : ""}
      </div>
      <div className="right-section">
        {weatherInfo ? (
          <div className="weather-details-box">
            <h2>{weatherInfo.location.name}</h2>
            <h4>{weatherInfo.location.country}</h4>
            <p className="time">{weatherInfo.location.localtime}</p>
            <p className="temperature">{weatherInfo.current.temp_c}°</p>
            <p className="condition">{weatherInfo.current.condition.text}</p>
            <img src={weatherInfo.current.condition.icon} alt="Weather icon" />
            <div className="additional-details">
              <p>Precipitation:<br />{weatherInfo.current.precip_mm} mm</p>
              <p>Humidity:<br />{weatherInfo.current.humidity}%</p>
              <p>Wind:<br />{weatherInfo.current.wind_kph} km/h</p>
            </div>
            <div className="forecast">
              {filteredHourlyData.map((hour, index) => (
                <div key={index} className="hourly-info">
                  <p>{hour.time.split(" ")[1]}</p>
                  <p>{hour.temp_c}°</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-weather-info">Enter a city to see the weather</div>
        )}
      </div>
    </div>
  );
};

export default CustomWeather;
