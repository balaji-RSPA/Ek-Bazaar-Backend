const hookRouter = require('express').Router();
const { hookAuth } = require('../middleware/hookAuth')
const payment = require('../controllers/web/paymentController')

hookRouter.post('/webhooks/paymentCaptured', hookAuth, payment.paymentCaptured)

hookRouter.post('/webhooks/subscriptionPending', payment.pendingSubWebHook2)
hookRouter.post('/webhooks/subscriptionHalted', payment.subscriptionHalted2)
hookRouter.post('/webhooks/subscriptionCharged', payment.subscriptionCharged2)

module.exports = hookRouter