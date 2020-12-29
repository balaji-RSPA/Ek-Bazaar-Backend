const router = require('express').Router()
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')

router.use(buyer)
router.use(seller)

module.exports = router