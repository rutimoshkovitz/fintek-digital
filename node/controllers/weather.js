import axios from "axios";

// Fetch weather data for a given location
const getWeatherByLocation = async (req, res) => {
    const { location } = req.query;
    if (!location)
        return res.status(400).json({ error: "Location parameter is required" });
    try {
        const result = await axios.get(process.env.WEATHER_FORECAST_API_URL, {
            params: { key: process.env.WEATHER_FORECAST_API_KEY, q: location, aqi: "no", day: 2 }
        });
        return res.json(result.data);
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: "Failed to fetch weather data" });
    }
};

// Fetch all places from different countries
const getAllPlacesInCountries = async (req, res) => {
    try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries");
        const places = response.data.data.flatMap((country) => country.cities);
        return res.json({ places });
    } catch (err) {
        console.error("Error fetching places:", err.message);
        return res.status(500).json({ error: "Failed to fetch places" });
    }
};

export { getWeatherByLocation, getAllPlacesInCountries };