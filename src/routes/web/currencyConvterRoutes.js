const express = require('express');

const { Router } = express;
const router = Router();

const currencyConveter = require('../../controllers/web/currencyConveterController')

/* 
This will Return 1 Doller in Rupies
*/
router.get('/currencyConveter', currencyConveter.getSingleCurrency)

router.post('/currencyConveter', currencyConveter.addCurrencyConveter)

router.get('/getAllCurrency',currencyConveter.getAllCurrency)

module.exports = router;