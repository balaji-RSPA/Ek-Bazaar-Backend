const express = require('express')
const { Router } = express
const router = Router()
const Pincode = require('../../controllers/web/pincodeController')
const { authenticate } = require("../../middleware/auth");

router.post('/pincode', Pincode.addPincode)

module.exports = router