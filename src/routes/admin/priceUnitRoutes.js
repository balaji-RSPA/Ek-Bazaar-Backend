const express = require("express");
const { Router } = express;
const router = Router();

const priceUnit = require('../../controllers/admin/priceUnitController')


router.post("/addPriceUnits",priceUnit.addPriceUnits)



module.exports = router;