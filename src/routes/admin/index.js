const router = require('express').Router()
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const location = require('./locationRoutes')
const category = require('./categoryRoutes')
const rfp = require('./rfpRoutes')

router.use(buyer)
router.use(seller)
router.use(location)
router.use(category)
router.use(rfp)


module.exports = router