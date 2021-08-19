// const { result } = require('lodash')
const { sortBy } = require('lodash')
const SellerProducts = require('../models/sellerProductListSchema')

module.exports.sellerProductsBulkInsert = (data) =>
    new Promise((resolve, reject) => {
        SellerProducts.insertMany(data, function (err, result) {
            if (err) reject(err)
            else {
                // console.log(result, ' product data---')
                if (result) {
                    const ids = result.map((val) => val._id)
                    resolve(ids)
                }
                reject(result)
            }
        })


    })

module.exports.searchProducts = (query) => new Promise((resolve, reject) => {
    console.log("🚀 ~ file: sellerProductModule.js ~ line 23 ~ module.exports.searchProducts= ~ query", query)
    SellerProducts.find(query)
        .then(doc => resolve(doc))
        .catch(error => reject(error))
})

module.exports.deleteSellerProducts = (query) => new Promise((resolve, reject) => {
    SellerProducts.deleteMany(query)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.getSellerProducts = (query, skip, limit) => new Promise((resolve, reject) => {
    SellerProducts.find(query)
        .skip(skip)
        .limit(limit)
        // .sort({ '_id': -1 })
        .populate({
            path: 'serviceCity.city serviceCity.state serviceCity.country'
        })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.updateSellerProducts = (query, data) => new Promise((resolve, reject) => {
    SellerProducts.updateMany(query, data, {
        new: true
    })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})
