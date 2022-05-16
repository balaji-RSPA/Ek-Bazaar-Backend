const { SubChargedRes, SubPendingRes, SubHaltedRes, cancleHookRes, PaymentFailedHook } = require('../models');

exports.saveSubChargedHookRes = (data) =>
    new Promise((resolve, reject) => {
        SubChargedRes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.getSubChargedHook = (query) =>
    new Promise((resolve, reject) => {
        SubChargedRes.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })    

exports.getSubChargedHookCount = (query) =>
    new Promise((resolve, reject) => {
        SubChargedRes.count(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })    

exports.saveSubPendingHookRes = (data) =>
    new Promise((resolve, reject) => {
        SubPendingRes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.getSubPendingHook = (query) =>
    new Promise((resolve, reject) => {
        SubPendingRes.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.updateSubPendingHook = (query, data) =>
    new Promise((resolve, reject) => {
        SubPendingRes.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })         

exports.saveSubHaltedHookRes = (data) =>
    new Promise((resolve, reject) => {
        SubHaltedRes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.getSubHaltedHook = (query) =>
    new Promise((resolve, reject) => {
        SubHaltedRes.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.updateSubHaltedHook = (query, data) =>
    new Promise((resolve, reject) => {
        SubHaltedRes.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })     
    
exports.saveSubCancledHookRes = (data) =>
    new Promise((resolve, reject) => {
        cancleHookRes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

exports.getSubCancledHook = (query) =>
    new Promise((resolve, reject) => {
        cancleHookRes.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })  
    
exports.updateSubCancledHook = (query, data) =>
    new Promise((resolve, reject) => {
        cancleHookRes.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
exports.saveCancledPaymentHookRes = (data) =>
    new Promise((resolve, reject) => {
        PaymentFailedHook.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })    

exports.getCancledPaymentHook = (query) =>
    new Promise((resolve, reject) => {
        PaymentFailedHook.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    }) 
    
    
exports.updateCancledPaymentHook = (query, data) =>
    new Promise((resolve, reject) => {
        PaymentFailedHook.findOneAndUpdate(query, data, {
            new: true
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })     
