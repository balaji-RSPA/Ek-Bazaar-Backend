const express = require("express");
const location = require('../../controllers/web/locationsController')
const { Router } = express;
const router = Router();

router.get('/cities', location.getAllCities)

router.get("/states", location.getAllStates);
// router.post("/states", location.createState)
// router.post("/statesBulkInsert", location.statesBulkInsert)
// router.post("/citiesBulkInsert", location.citiesBulkInsert)

router.get("/countries", location.getAllCountries)
router.post("/countries", location.createCountry)


// router.post("/uploadNewCities", location.uploadNewCities)
// router.get("/updateCountry", location.updateCountry)

// router.get("/cities", location.getAllCities)
// router.post("/city", location.createCity)


// router.post("/uploadCityAlias", location.uploadCityAlias)
// router.get("/updateCityAlias", location.updateCityAlias)

module.exports = router;