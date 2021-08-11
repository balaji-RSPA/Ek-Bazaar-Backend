const mongoose = require('mongoose')
const QueEmails = require('../models/queEmailSchema')

exports.getQueEmail = (query, skip, limit) => new Promise((resolve, reject) => {

    QueEmails.find(query)
        .skip(skip || 0)
        .limit(limit || 10)
        .then((doc) => {

            if (doc) resolve(doc)
            else reject(new Error('No records'))

        })
        .catch(reject)

})

exports.updateQueEmails = (query, newData) => new Promise((resolve, reject) => {

    QueEmails.updateMany(query, {
        $set: newData
    }, {
        new: true
    }).then((doc) => {

        resolve(doc)

    }).catch(reject)

})

exports.bulkInserQemails = (data) => new Promise((resolve, reject) => {

    QueEmails.insertMany(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch(reject)

})
