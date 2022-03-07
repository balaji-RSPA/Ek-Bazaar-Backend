const { Paylinks } = require('../models');

exports.createPayLinks = (data) =>
    new Promise((resolve, reject) => {
        Paylinks.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.updatePayLinks = (query, data) =>
    new Promise((resolve, reject) => {
        Paylinks.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.findPayLink = (query) =>
    new Promise((resolve, reject) => {
        Paylinks.findOne(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })     
