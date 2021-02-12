const mongoose = require('mongoose')
const { Orders, OrdersPlans } = require('../models')

// Orders collection modules
exports.addOrders = (data) =>
    new Promise((resolve, reject) => {
        Orders.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.updateOrder = (query, data) =>
    new Promise((resolve, reject) => {
        Orders.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

// Order plan collection modules

exports.addOrdersPlans = (data) =>
    new Promise((resolve, reject) => {
        OrdersPlans.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.updateOrderPlan = (query, data) =>
    new Promise((resolve, reject) => {
        OrdersPlans.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })