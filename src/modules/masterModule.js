const { reject } = require('lodash')
const { MasterCollection } = require('../models')

module.exports.getMaster = (reqQuery, range) => new Promise((resolve, reject) => {

    const skip = parseInt(range.skip) || 0;
    const limit = parseInt(range.limit) || 100;
    // console.log("🚀 ~ file: masterModule.js ~ line 5 ~ module.exports.getMaster= ~ reqQuery", reqQuery, range)

    MasterCollection.find(reqQuery)
        .skip(skip).
        limit(limit)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.addMaster = (data) => new Promise((resolve, reject) => {

    MasterCollection.create(data)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})
module.exports.insertManyMaster = (data) => new Promise((resolve, reject) => {

    MasterCollection.insertMany(data)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.updateMaster = (query, data) => new Promise((resolve, reject) => {

    MasterCollection.findOneAndUpdate(query, data, { new: true })
        .then((doc) => {
            resolve(doc);
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.deleteMasterProduct = (data) =>
    new Promise((resolve, reject) => {
        MasterCollection.findByIdAndDelete({
            _id: data
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

module.exports.updateMasterBulkProducts = (query, data) => new Promise((resolve, reject) => {
    MasterCollection.updateMany(query, data, {
        new: true
    })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.getMasterRecords = (reqQuery, range) => new Promise((resolve, reject) => {

    const skip = parseInt(range.skip) || 0;
    const limit = parseInt(range.limit) || 100;

    MasterCollection.find(reqQuery)
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .populate('sellerId._id')
        .lean()
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.bulkDeleteMasterProducts = (query) =>
    new Promise((resolve, reject) => {
        MasterCollection.deleteMany(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })