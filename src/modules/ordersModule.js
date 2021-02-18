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

exports.getOrders = (query, range) =>
    new Promise((resolve, reject) => {
        const skip = parseInt(range.skip) || 0
        const limit = parseInt(range.limit) || 10
        console.log(skip, limit, ' rrrrrr')
        Orders.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .populate('paymentId')
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.getOrdersCount = (query) =>
    new Promise((resolve, reject) => {
        Orders.count(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })