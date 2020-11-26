// const { result } = require('lodash')
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
    SellerProducts.find(query)
        .then(doc => resolve(doc))
        .catch(error => reject(error))
})
