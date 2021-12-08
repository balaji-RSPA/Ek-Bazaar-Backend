const Cities = require('./citiesSchema')
const States = require('./statesSchema')
const Countries = require('./countriesSchema')
const Products = require('./productsSchema')
const Buyers = require('./buyersSchema')
const Sellers = require('./sellersSchema')
const RFP = require('./rfpSchema')
const ParentCategory = require('./parentCategorySchema')
const PrimaryCategory = require('./primaryCategorySchema')
const SecondaryCategory = require('./secondaryCategorySchema')
const SellerBusiness = require('./sellerBusinessSchema')
const SellerStatutory = require('./sellerStatutorySchema')
const SellerEstablishment = require('./sellerEstablishmentSchema')
const SellerContact = require('./sellerContactsSchema')
const SellerCompany = require('./sellerCompanySchema')
const SellerProducts = require('./sellerProductListSchema')
const SellerTypes = require('./sellertTypesSchema')
const ProductsSubCategories = require("./productsSubCategoriesSchema")
const SubscriptionPlan = require('./subscriptionPlanSchema')
const MasterCollection = require('./MasterCollectionSchema')
const RemoveListing = require('./removeListingSchema')
const SMSQue = require('./SMSQueSchema')
const SellerPlans = require('./sellerPlanSchema')
const QueEmails = require('./queEmailSchema')
const SellerPlanLog = require('./sellerPlansLogSchema')
const Payments = require('./paymentSchema')
const Orders = require('./ordersSchema')
const OrdersPlans = require('./orderPlanSchema')
const InvoiceNumber = require('./invoiceNumberSchema')
const Suggestions = require('./suggestionsSchema')
const Chat = require('./chatSchema')
const Pincodes = require('./pincode')
const SellerOffferContacts = require('./sellerOfferContactSchema')
// const Users = require('./user')
const News = require("./newsSchema");
const Commodity = require("./commoditySchema");
const LanguageTemplate = require('./languageTemplateSchema')
const CurrencyConvters = require('./currencyConverterSchema')

module.exports = {
    Cities,
    States,
    Countries,
    Products,
    Buyers,
    Sellers,
    RFP,
    ParentCategory,
    PrimaryCategory,
    SecondaryCategory,
    SellerBusiness,
    SellerStatutory,
    SellerEstablishment,
    SellerContact,
    SellerCompany,
    SellerProducts,
    SellerTypes,
    ProductsSubCategories,
    SubscriptionPlan,
    MasterCollection,
    RemoveListing,
    SMSQue,
    SellerPlans,
    QueEmails,
    SellerPlanLog,
    Payments,
    Orders,
    OrdersPlans,
    InvoiceNumber,
    Suggestions,
    Chat,
    Pincodes,
    SellerOffferContacts,
    News,
    Commodity,
    LanguageTemplate,
    CurrencyConvters
}