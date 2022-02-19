const express = require('express')
const { Router } = express
const router = Router()
const payment = require('../../controllers/web/paymentController')

router.post('/createRazorPayOrder', payment.createRazorPayOrder)
router.post('/captureRazorPayPayment/:paymentId', payment.captureRazorPayPayment)

router.post('/cancleSubscription', payment.cancleSubscription)

router.post('/stripe/charge', payment.createStripePayment)
router.post('/planActivation/:paymentId', payment.planActivation)

router.post('/subscriptionPending', payment.pendingSubWebHook)
router.post('/subscriptionHalted', payment.subscriptionHalted)
router.post('/subscriptionCharged', payment.subscriptionCharged)
module.exports = router