const hookRouter = require('express').Router();
const { hookAuth } = require('../middleware/hookAuth')
const payment = require('../controllers/web/paymentController')

hookRouter.post('/webhooks/paymentCaptured', hookAuth, payment.paymentCaptured)

hookRouter.post('/webhooks/subscriptionPending', payment.pendingSubWebHook)
hookRouter.post('/webhooks/subscriptionHalted', payment.subscriptionHalted)
hookRouter.post('/webhooks/subscriptionCharged', payment.subscriptionCharged)
hookRouter.post('/webhook/subscriptionCancle',payment.subscriptionCancleHook)
hookRouter.post('/webhook/paymentFailed',payment.paymentFailedHook)

hookRouter.post('/webhooks/stripPaymentLink', payment.captureStripWebhook)

module.exports = hookRouter