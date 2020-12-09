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
// const Users = require('./user')

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
    ProductsSubCategories
    // Users
}