const hookRouter = require('express').Router();
const { hookAuth } = require('../middleware/hookAuth')
const payment = require('../controllers/web/paymentController')

hookRouter.post('/webhooks/paymentCaptured', hookAuth, payment.paymentCaptured)

hookRouter.post('webhooks/subscriptionPending', hookAuth, payment.pendingSubWebHook)
hookRouter.post('webhooks/subscriptionHalted', hookAuth, payment.subscriptionHalted)
hookRouter.post('webhooks/subscriptionCharged', hookAuth, payment.subscriptionCharged)

module.exports = hookRouter