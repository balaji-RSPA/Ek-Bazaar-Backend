const PriceUnit = require('../models/priceUnitSchema');

exports.create = (data) =>
    new Promise((resolve, reject) => {
        PriceUnit.insertMany(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.getPriceUnits = (query) => new Promise((resolve,reject) => {
    PriceUnit.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
})    