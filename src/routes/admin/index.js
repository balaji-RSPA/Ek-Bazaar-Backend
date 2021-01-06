const router = require('express').Router()
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const location = require('./locationRoutes')
const category = require('./categoryRoutes')
const rfp = require('./rfpRoutes')
const subscriptionPlan = require('./subscriptionPlanRoutes')

router.use(buyer)
router.use(seller)
router.use(location)
router.use(category)
router.use(rfp)
router.use(subscriptionPlan)


module.exports = router