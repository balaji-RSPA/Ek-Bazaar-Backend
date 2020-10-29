const router = require('express').Router()
const location = require('./locationRoutes')
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const category = require('./categotyRoutes')

router.use(location)
router.use(buyer)
router.use(seller)
router.use(category)

module.exports = router