const Sellers = require('../models/sellersSchema')
// const SellerBusiness = require('../models/sellerBusinessSchema')
const {
    ParentCategory,
    PrimaryCategory,
    SecondaryCategory,
    Products,
    ProductsSubCategories,

    SellerBusiness,
    SellerStatutory,
    SellerCompany,
    SellerEstablishment,
    SellerContact,
    MasterCollection,

    Buyers
} = require('../models')

/**
   * Get All seller details
  */
module.exports.getAllSellerDetails = (query) => new Promise((resolve, reject) => {
    Sellers.find(query)
        .populate('planId')
        .populate('busenessId')
        .populate('statutoryId')
        .populate('establishmentId')
        .populate('sellerCompanyId')
        .populate('sellerContactId')
        .populate('sellerProductId')
        .populate({
            path: "location.city location.state location.country"
        })
        .populate({
            path: 'sellerContactId',
            model: SellerContact,
            populate: {
                path: "location.city location.state location.country",
                // model: Cities
            }
        })
        .populate({
            path: 'sellerProductId',
            // model: SellersContact,
            populate: {
                path: "serviceType",
                select: "name"
            }
        })
        .populate({
            path: 'sellerProductId',
            // model: SellersContact,
            populate: {
                path: "parentCategoryId",
                model: ParentCategory.collection.name,
                select: "name vendorId"
            }
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: "primaryCategoryId",
                model: PrimaryCategory.collection.name,
                select: "name vendorId"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: "secondaryCategoryId",
                model: SecondaryCategory.collection.name,
                select: "name vendorId"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: "poductId",
                model: Products.collection.name,
                select: "name vendorId"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: "productSubcategoryId",
                model: ProductsSubCategories.collection.name,
                select: "name vendorId"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.regionOfOrigin',
                select: "name region"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.countryOfOrigin',
                select: "name"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.cityOfOrigin',
                select: "name"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingCountries',
                select: "name"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingStates',
                select: "name region"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingCities',
                select: "name"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.city',
                select: "name"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.state',
                select: "name region"
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.country',
                select: "name"
            },
        })
        .skip(1800)
        .limit(723)
        .lean()
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

/**
   * Add seller business details
  */
module.exports.addSellerBusiness = (data) => new Promise((resolve, reject) => {
    SellerBusiness.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.addSellerStatutory = (data) => new Promise((resolve, reject) => {
    SellerStatutory.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.addSellerCompany = (data) => new Promise((resolve, reject) => {
    SellerCompany.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.addSellerContact = (data) => new Promise((resolve, reject) => {
    SellerContact.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.addSellerEstablishment = (data) => new Promise((resolve, reject) => {
    SellerEstablishment.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.getLevelOne = (query) => new Promise((resolve, reject) => {
    ParentCategory.find(query)
        .select('name vendorId')
        .then(doc => resolve(doc))
        .catch(error => reject(error))
})

exports.getLevelTwo = (query) => new Promise((resolve, reject) => {
    PrimaryCategory.find(query)
        .select('name vendorId')
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})

exports.getLevelThree = (query) => new Promise((resolve, reject) => {
    SecondaryCategory.find(query)
        .select('name vendorId')
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})
exports.getLevelFour = (query) => new Promise((resolve, reject) => {
    Products.find(query)
        .select('name vendorId')
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})
exports.getLevelFive = (query) => new Promise((resolve, reject) => {
    ProductsSubCategories.find(query)
        .select('name vendorId')
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})
exports.getAllMasterProducts = (query) => new Promise((resolve, reject) => {
    MasterCollection.find(query)
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})

// Buyers 
exports.getAllBuyers = (query) => new Promise((resolve, reject) => {
    Buyers.find(query)
        .then((doc) => resolve(doc))
        .catch((error) => reject(error));
})

