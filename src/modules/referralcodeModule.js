const { Referalcodes } = require("../models")

// module.exports.getAllReferralcodes = (query, skip, limit) => new Promise((resolve, reject) => {
//     Referalcodes.find(query)
//         .skip(skip)
//         .limit(limit)
//         .then(doc => {
//             resolve(doc)
//         })
//         .catch(error => reject(error))
// })

/**
   * Add Referralcodes
*/
module.exports.addReferralcode = (data) =>
    new Promise((resolve, reject) => {
        Referalcodes.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })
/**
   * Edit Referralcodes
*/
module.exports.updateReferralcode = (ReferralId, data) =>
    new Promise((resolve, reject) => {
        Referalcodes.findOneAndUpdate(
            ReferralId, {
            $set: data
        }, {
            new: true,
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })
/**
   * Delete Referralcodes
*/
module.exports.deleteReferralcode = (query) =>
    new Promise((resolve, reject) => {
        Referalcodes.findOneAndDelete(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })
/**
   * Get Referralcodes
  */
module.exports.getReferralcodeDetail = (query) => new Promise((resolve, reject) => {
    Referalcodes.findOne(query)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})
/**
   * Get All Referralcodes
  */
module.exports.getAllReferralcode = (query, skip, limit) => new Promise((resolve, reject) => {

    Referalcodes.find(query)
        .skip(skip)
        .select('-referralcode')
        .limit(limit)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})

exports.VerifyReferralCode = (query) => new Promise((resolve, reject) => {
    Referalcodes.findOne(query)
        .then(doc => {
            resolve(doc)
        })
        .catch(error => reject(error))
})