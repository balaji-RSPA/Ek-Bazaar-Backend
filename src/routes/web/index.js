const router = require('express').Router()
const location = require('./locationRoutes')
const buyer = require('./buyerRoutes')
const seller = require('./sellerRoutes')
const category = require('./categotyRoutes')
const elastic = require('./elasticSearchRoutes')
const user = require('./userRoutes')
const subscriptionPlan = require('./subscriptionPlanRoutes');
const ekbPlans = require('./ekbTradePlans')
const contact = require('./contactRoutes')
const removeListing = require('./removeListingRoutes')
const payment = require('./paymentRoutes')
const chat = require('./rocketChatRoutes')
const Pincode = require('./pincodeRoutes')
const DigitalSpace = require('./digitalSpaceRoutes')
const Offers = require('./offerRouter')
const News = require('./newsRoutes');
const Commodity = require('./commodityRoutes');
const currencyConvter = require('./currencyConvterRoutes')
const whatsApp = require('./whatsappRoutes')
const referal = require('./referralcodeRoutes')
const language=require('./languageRoutes')

router.use(location)
router.use(buyer)
router.use(seller)
router.use(category)
router.use(elastic)
router.use(user)
router.use(subscriptionPlan)
router.use(ekbPlans)
router.use(contact)
router.use(removeListing)
router.use(payment)
router.use(chat)
router.use(Pincode)
router.use(DigitalSpace)
router.use(Offers)
router.use(News)
router.use(Commodity)
router.use(currencyConvter)
router.use(whatsApp)
router.use(referal)
router.use(language)

module.exports = router