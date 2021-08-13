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
    // console.log(query)
    SMSQue.find(query)
        .skip(skip)
        .limit(limit)
        .then((doc) => {
            resolve(doc)
        })
        .catch(reject)
})

module.exports.updateQueSMS = (query, data) => new Promise((resolve, reject) => {
    SMSQue.updateMany(query, data, {
        new: true
    })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})