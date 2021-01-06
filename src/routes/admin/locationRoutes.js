const express = require("express");
const { Router } = express;
const router = Router();
const location = require("../../controllers/admin/locationController");
const { authenticate } = require("../../middleware/auth");

router.get("/cities",authenticate,location.getCities);
router.get("/states", authenticate,location.getStates);
router.get("/countries",authenticate, location.getCountries);

module.exports = router;