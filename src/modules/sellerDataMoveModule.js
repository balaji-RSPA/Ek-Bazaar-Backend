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
    SellerContact
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
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.countryOfOrigin',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.cityOfOrigin',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingCountries',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingStates',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'productDetails.sellingCities',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.city',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.state',
            },
        })
        .populate({
            path: 'sellerProductId',
            model: 'sellerproducts',
            populate: {
                path: 'serviceCity.country',
            },
        })
        .limit(10)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

/**
   * Add seller business details
  */
module.exports.addSellerBusiness = (data) => new Promise((resolve, reject) => {
    // SellerBusiness.create(data)
    //     .then(doc => {
    //         resolve(doc)
    //     })
    // .catch (error => reject(error))
})

module.exports.addSellerStatutory = (data) => new Promise((resolve, reject) => {
    // SellerStatutory.create(data)
    //     .then(doc => {
    //         resolve(doc)
    //     })
    // .catch (error => reject(error))
})

module.exports.addSellerCompany = (data) => new Promise((resolve, reject) => {
    // SellerCompany.create(data)
    //     .then(doc => {
    //         resolve(doc)
    //     })
    // .catch (error => reject(error))
})

module.exports.addSellerContact = (data) => new Promise((resolve, reject) => {
    // SellerContact.create(data)
    //     .then(doc => {
    //         resolve(doc)
    //     })
    // .catch (error => reject(error))
})

module.exports.addSellerEstablishment = (data) => new Promise((resolve, reject) => {
    // SellerEstablishment.create(data)
    //     .then(doc => {
    //         resolve(doc)
    //     })
    // .catch (error => reject(error))
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
