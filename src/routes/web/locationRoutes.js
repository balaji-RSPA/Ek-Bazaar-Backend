const express = require("express");
const location = require('../../controllers/web/locationsController')
const { Router } = express;
const router = Router();

router.get("/states", location.getAllStates);

module.exports = router;