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

    // const today = moment().format('YYYY-MM-DD')// .format('YYYY-MM-DD hh:mm:ss').replace(" ", 'T').concat('Z')
    // console.log(new Date(moment().subtract({ days: 15, months: 3 }).startOf('day').format('YYYY-MM-DD')), "=========")
    // console.log(new Date(moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD')), 'eeeeeeeeeeee')
    SellerPlans.find({
        // $and: [
        //     {
        //         expireStatus: false,
        //         exprireDate: {
        //             $gte: new Date(moment().startOf('day').format('YYYY-MM-DD')), // today.toDate(),
        //             $lt: new Date(moment().add(1, 'day').endOf('day').format('YYYY-MM-DD')) // moment(today).endOf('day').toDate()
        //         }
        //     }
        // ]
        $or:[
            {
                exprireDate : {
                    $gte: new Date(moment().subtract(1,'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },{
                exprireDate: {
                    $gte: new Date(moment().subtract(3, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(3, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },{
                exprireDate: {
                    $gte: new Date(moment().subtract(5, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(5, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },

            {
                exprireDate: {
                    $gte: new Date(moment().subtract(7, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(7, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },
            {
                exprireDate: {
                    $gte: new Date(moment().subtract(10, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(10, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },
            {
                exprireDate: {
                    $gte: new Date(moment().subtract(15, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(15, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },
            {
                exprireDate: {
                    $gte: new Date(moment().subtract(30, 'day').startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract(30, 'day').endOf('day').format('YYYY-MM-DD'))
                }
            },
                //months
            {
                exprireDate: {
                    $gte: new Date(moment().subtract({ days: 15, months: 1 }).startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract({ days: 15, months: 1 }).endOf('day').format('YYYY-MM-DD'))
                }
            },
            {
                exprireDate: {
                    $gte: new Date(moment().subtract({ days: 15, months: 2 }).startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract({ days: 15, months: 2 }).endOf('day').format('YYYY-MM-DD'))
                }
            },
            {
                exprireDate: {
                    $gte: new Date(moment().subtract({ days: 15, months: 3 }).startOf('day').format('YYYY-MM-DD')),
                    $lte: new Date(moment().subtract({ days: 15, months: 3 }).endOf('day').format('YYYY-MM-DD'))
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
                $or:[
                    {
                    exprireDate: {
                        $gte: new Date(moment().add(7, 'day').startOf('day').format('YYYY-MM-DD')),
                        $lte: new Date(moment().add(7, 'day').endOf('day').format('YYYY-MM-DD'))
                     }
                    },
                    {
                        exprireDate: {
                            $gte: new Date(moment().add(5, 'day').startOf('day').format('YYYY-MM-DD')),
                            $lte: new Date(moment().add(5, 'day').endOf('day').format('YYYY-MM-DD'))
                        }
                    },
                    {
                        exprireDate: {
                            $gte: new Date(moment().add(3, 'day').startOf('day').format('YYYY-MM-DD')),
                            $lte: new Date(moment().add(3, 'day').endOf('day').format('YYYY-MM-DD'))
                        }
                    },
                    {
                        exprireDate: {
                            $gte: new Date(moment().add(2, 'day').startOf('day').format('YYYY-MM-DD')),
                            $lte: new Date(moment().add(2, 'day').endOf('day').format('YYYY-MM-DD'))
                        }
                    },
                    {
                        exprireDate: {
                            $gte: new Date(moment().add(1, 'day').startOf('day').format('YYYY-MM-DD')),
                            $lte: new Date(moment().add(1, 'day').endOf('day').format('YYYY-MM-DD'))
                        }
                    },
                    {
                        exprireDate: {
                            $gte: new Date(moment().startOf('day').format('YYYY-MM-DD')),
                            $lte: new Date(moment().endOf('day').format('YYYY-MM-DD'))
                        }
                    },
                ]
            }]
        })
        .populate('sellerId')
        .then((doc) => {
            console.log(doc.length)
            resolve(doc)
        })
    .catch((error) => reject(error))
    })

