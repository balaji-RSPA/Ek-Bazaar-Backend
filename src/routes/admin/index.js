const router = require('express').Router()
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const location = require('./locationRoutes')

router.use(buyer)
router.use(seller)
router.use(location)

module.exports = router