const express = require("express");
const location = require('../../controllers/web/locationsController')
const { Router } = express;
const router = Router();

router.get('/cities', location.getAllCities)

router.get("/states", location.getAllStates);
router.post("/states", location.createState)

router.get("/countries", location.getAllCountries)
router.post("/countries", location.createCountry)

module.exports = router;