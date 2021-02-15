const {
    InvoiceNumber
} = require("../models");

module.exports.addInvoiceNumber = (data) => new Promise((resolve, reject) => {
    InvoiceNumber.create(data)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})
module.exports.getInvoiceNumber = (query) => new Promise((resolve, reject) => {
    InvoiceNumber.findOne(query)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

module.exports.updateInvoiceNumber = (query, data) => new Promise((resolve, reject) => {
    InvoiceNumber.findOneAndUpdate({ id: 1 }, data, { new: true, upsert: true })
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})