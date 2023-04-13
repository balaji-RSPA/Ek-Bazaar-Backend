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
const Paylinks = require('./payLinkSchema')
const Orders = require('./ordersSchema')
const Recurring = require('./recurringOrderSchema')
const subOrderslogs = require('./subscriptionOrderLogSchema')
const pendingSubOrders = require('./pendingSubscriptionSchema')
const cancleHookRes = require('./sub_Cancled_Hook_Schema')
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
const LanguageTemplateL4 = require('./languageTemplateL4Schema');
const LanguageTemplateL5 = require('./languageTemplateL5Schema');
const LanguageTemplateOne = require('./languageTemplateOneSchema')
const CurrencyConvters = require('./currencyConverterSchema')
const currencyExcenges = require('./currencySchema')
const currencyINRExcenges = require('./currencyINRSchema')
const SubChargedRes = require('./subChargedHookSchema')
const SubPendingRes = require('./subPendingHookSchema')
const SubHaltedRes = require('./subHaltedHookSchema')
const PaymentFailedHook = require('./paymentFailedHookSchema')
const PriceUnit = require('./priceUnitSchema')
const PaymentData = require('./paymentDataSchema');
const Contact = require('./contactSchema')
const LanguageTemplateL4One = require('./languageTemplateL4OneSchema')
const LanguageTemplateL5One = require('./languageTemplateL5OneSchema')
const WhatsappTemplate = require('./whatsappTemplateSchema')
const currentOTPs = require('./otpSchema')
const Datecol=require("./dateSchema")
const Referalcodes=require("./referralcodeSchema")

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
    Recurring,
    subOrderslogs,
    OrdersPlans,
    InvoiceNumber,
    pendingSubOrders,
    Suggestions,
    Chat,
    Pincodes,
    SellerOffferContacts,
    News,
    Commodity,
    LanguageTemplate,
    LanguageTemplateL4,
    LanguageTemplateL5,
    LanguageTemplateOne,
    LanguageTemplateL4One,
    LanguageTemplateL5One,
    CurrencyConvters,
    PaymentData,
    Paylinks,
    SubChargedRes,
    SubPendingRes,
    SubHaltedRes,
    cancleHookRes,
    PaymentFailedHook,
    PriceUnit,
    Contact,
    currencyExcenges,
    WhatsappTemplate,
    currencyINRExcenges,
    currentOTPs,
    Datecol,
    Referalcodes
}