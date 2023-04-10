const express = require('express')
const { Router } = express
const router = Router()
const payment = require('../../controllers/web/paymentController')
const { subscriptionPaymentAuth} = require('../../middleware/paymentAuth')

router.post('/createRazorPayOrder', payment.createRazorPayOrder)
router.post('/captureRazorPayPayment/:paymentId', payment.captureRazorPayPayment)
router.post('/fetchSubscriptionPayment',subscriptionPaymentAuth,payment.fetchSubscriptionPayment)
router.post('/checkPaymentStatus/:paymentId', payment.checkPaymentStatus)
// router.post('/captureRazorPayPayment/:paymentId', payment.captureRazorPayPaymentTwo)
router.post('/createRazorPayPaymentLink', payment.createRazorPayLink)
router.post('/whatsappEKBpayment',payment.createWhatsappPaymentLink)

router.post('/cancleSubscription', payment.cancleSubscription)
router.get('/captureLinkPayment', payment.captureLink)

router.post('/stripe/charge', payment.createStripePayment)
router.post('/planActivation/:paymentId', payment.planActivation)
router.post('/whtasappONEpayment',payment.createStripeLink);

// router.post('/subscriptionPending', payment.pendingSubWebHook)
// router.post('/subscriptionHalted', payment.subscriptionHalted)
// router.post('/subscriptionCharged', payment.subscriptionCharged)
module.exports = router