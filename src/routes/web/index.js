const router = require('express').Router()
const location = require('./locationRoutes')
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const category = require('./categotyRoutes')
const elastic = require('./elasticSearchRoutes')
const user = require('./userRoutes')

router.use(location)
router.use(buyer)
router.use(seller)
router.use(category)
router.use(elastic)
router.use(user)

module.exports = router