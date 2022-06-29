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
const OrdersLog = require('./ordersLogModule')
const Payments = require('./paymentModule')
const Paylinks = require('./payLinkModule')
const subChargedHook = require('./subChargedHookModule')
const InvoiceNumber = require('./invoiceNumberModule')
const Chat = require('./chatModule')
const Pincode = require('./pincodeModule')
const News = require('./newsModule');
const Commodity = require('./commodityModule');
const LanguageTemplate = require('./languageTemplateModule')
const LanguageTemplateOne = require('./languageTemplateOneModule')
const CurrencyConvrter = require('./currencyConverterModule')
const PaymentData = require('./paymentDataModule')
const PriceUnit = require('./priceUnitModule')
const ContactUs = require('./contactModule')

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
    OrdersLog,
    Payments,
    Paylinks,
    InvoiceNumber,
    Chat,
    Pincode,
    News,
    Commodity,
    LanguageTemplate,
    LanguageTemplateOne,
    CurrencyConvrter,
    PaymentData,
    subChargedHook,
    PriceUnit,
    ContactUs
}