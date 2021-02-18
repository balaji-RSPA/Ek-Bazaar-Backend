const mongoose = require('mongoose')
const { SellerPlans } = require('../models')
const moment = require("moment");

module.exports.createTrialPlan = (query) =>
    new Promise((resolve, reject) => {
        SellerPlans.create(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.createPlan = (query) =>
    new Promise((resolve, reject) => {
        SellerPlans.create(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.updateSellerPlan = (query, data) =>
    new Promise((resolve, reject) => {
        SellerPlans.findOneAndUpdate(query, {
            $set: data
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.getSellerPlan = (query) =>
    new Promise((resolve, reject) => {
        SellerPlans.findOne(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.updateSellerPlans = (query, data) =>
    new Promise((resolve, reject) => {
        SellerPlans.updateMany(query, {
            $set: data
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

exports.getExpirePlans = () => new Promise((resolve, reject) => {

    const today = moment().format('YYYY-MM-DD')// .format('YYYY-MM-DD hh:mm:ss').replace(" ", 'T').concat('Z')
    console.log(new Date(moment().startOf('day').format('YYYY-MM-DD')), 'sssssssss')
    console.log(new Date(moment().add(1, 'day').endOf('day').format('YYYY-MM-DD')), 'eeeeeeeeeeee')
    SellerPlans.find({
        $and: [
            {
                expireStatus: false,
                exprireDate: {
                    $gte: new Date(moment().startOf('day').format('YYYY-MM-DD')), // today.toDate(),
                    $lt: new Date(moment().add(1, 'day').endOf('day').format('YYYY-MM-DD')) // moment(today).endOf('day').toDate()
                }
            }
        ]
    })
        .populate('sellerId')
        .then((doc) => {

            // console.log(doc, 'user plansssssssssssssssssss')
            if (doc) resolve(doc)
            else reject(new Error('No records'))

        }).catch(reject)

})

module.exports.getAboutToexpirePlan = () =>
    new Promise((resolve, reject) => {
        SellerPlans.find({
            $and: [{
                expireStatus: false,
                exprireDate: {
                     $gte: new Date(moment().subtract(2, 'day').endOf('day').format('YYYY-MM-DD')),
                     $lte: new Date(moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD'))
                }
            }]
        })
        .populate('sellerId')
        .then((doc) => {
            resolve(doc)
        })
    .catch((error) => reject(error))
    })

