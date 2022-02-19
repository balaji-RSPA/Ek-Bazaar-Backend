const mongoose = require('mongoose')
const { Payments } = require('../models')

exports.addPayment = (data) =>
    new Promise((resolve, reject) => {
        Payments.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.updatePayment = (query, data) =>
    new Promise((resolve, reject) => {
        Payments.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.findPayment = (query) => 
    new Promise((resolve,reject) => {
        Payments.findOne(query)
            // .populate('orderId')
            .populate({
                path: 'orderId',
                model: 'orders'
            })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })    