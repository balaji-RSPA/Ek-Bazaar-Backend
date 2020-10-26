const router = require('express').Router()
const location = require('./locationRoutes')
const buyer = require('./buyerRoutes')

router.use(location)
router.use(buyer)

module.exports = router