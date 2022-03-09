const { SubChargedRes, SubPendingRes, SubHaltedRes } = require('../models');

exports.saveSubChargedHookRes = (data) =>
    new Promise((resolve, reject) => {
        SubChargedRes.create(data)
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

exports.saveSubHaltedHookRes = (data) =>
    new Promise((resolve, reject) => {
        SubHaltedRes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })    
