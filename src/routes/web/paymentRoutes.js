const express = require('express')
const { Router } = express
const router = Router()
const payment = require('../../controllers/web/paymentController')

router.post('/createRazorPayOrder', payment.createRazorPayOrder)
router.post('/captureRazorPayPayment/:paymentId', payment.captureRazorPayPayment)

module.exports = router