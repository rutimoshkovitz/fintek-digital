import { Router } from "express";

import { getAllPlacesInCountries, getWeatherByLocation } from "../controllers/weather.js";

const router=Router();
router.get("/",getWeatherByLocation);
router.get("/cities",getAllPlacesInCountries)

export default router;