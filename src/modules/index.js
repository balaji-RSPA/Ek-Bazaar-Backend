const location = require('./locationsModule')
const buyers = require('./buyersModule')
const category = require('./categoryModule')
const sellers = require('./sellersModule')
const elastic = require('./elasticSearchModule')
const rfp = require('./rfpModule')
const subscriptionPlan = require('./subscriptionPlanModule')
const mastercollections = require('./masterModule')
const sellerProducts = require('./sellerProductModule')
const RemoveListing = require('./removeListingModule')
const SMSQue = require('./smsQueModule')
const SellerPlans = require('./sellerPlanModule')
const QueEmails = require('./queEmailsModule')
const SellerPlanLogs = require('./sellerPlanLogModule')
const Orders = require('./ordersModule')
const Payments = require('./paymentModule')
const InvoiceNumber = require('./invoiceNumberModule')

module.exports = {
    location,
    buyers,
    category,
    sellers,
    elastic,
    rfp,
    subscriptionPlan,
    mastercollections,
    sellerProducts,
    RemoveListing,
    SMSQue,
    SellerPlans,
    QueEmails,
    SellerPlanLogs,
    Orders,
    Payments,
    InvoiceNumber
}