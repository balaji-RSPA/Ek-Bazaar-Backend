const mongoose = require('mongoose')
const { SMSQue } = require('../models')

module.exports.queSMSBulkInsert = (data) => new Promise((resolve, reject) => {
    // console.log(data, 'ionser----------------------------')
    SMSQue.insertMany(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch(reject)
})

module.exports.getQueSMS = (query, range) => new Promise((resolve, reject) => {
    const skip = range.skip || 0
    const limit = range.limit || 100
    SMSQue.find(query)
        .then((doc) => {
            resolve(doc)
        })
        .catch(reject)
})