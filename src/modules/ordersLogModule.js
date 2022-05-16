const mongoose = require('mongoose');

const { subOrderslogs, pendingSubOrders, Recurring} = require('../models')

// For Orders Log
exports.addOrdersLog = (data) =>
    new Promise((resolve, reject) => {
        subOrderslogs.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.updateOrderLog = (query, data) =>
    new Promise((resolve, reject) => {
        subOrderslogs.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
// For Pending Subscription Module    

exports.addPendingSubscriptionOrders = (data) =>
    new Promise((resolve, reject) => {
        pendingSubOrders.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })


exports.updatePendingSubscriptionOrders = (query, data) =>
    new Promise((resolve, reject) => {
        pendingSubOrders.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })  
    
// For Recurring Model    
exports.addRecurringOrder = (data) =>
    new Promise((resolve, reject) => {
        Recurring.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })  
    
exports.updateRecurringOrder = (query, data) =>
    new Promise((resolve, reject) => {
        Recurring.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.getRecurringOrder = (query) => 
new Promise((resolve, reject)=> {
    Recurring.findOne(query)
        .then((doc)=>{
            resolve(doc)
        })
        .catch(reject)
})    