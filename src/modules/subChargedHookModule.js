const { SubChargedRes, SubPendingRes, SubHaltedRes, cancleHookRes } = require('../models');

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
