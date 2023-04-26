const router = require('express').Router()
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const location = require('./locationRoutes')
const category = require('./categoryRoutes')
const priceUnit = require('./priceUnitRoutes')
const rfp = require('./rfpRoutes')
const subscriptionPlan = require('./subscriptionPlanRoutes')
const news = require('./newsRoutes')
const commodity = require('./commodityRoutes');
const referralcode=require('./referralcodeRoutes')
const language=require('./languageRoute')

router.use(buyer)
router.use(seller)
router.use(location)
router.use(category)
router.use(rfp)
router.use(subscriptionPlan)
router.use(news);
router.use(commodity);
router.use(priceUnit)
router.use(referralcode)
router.use(language)

module.exports = router