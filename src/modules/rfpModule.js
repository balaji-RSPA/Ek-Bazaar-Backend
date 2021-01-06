const { RFP } = require("../models");
/**
   * Get RFP detail
  */
 module.exports.getRFPDetail = (query) => new Promise((resolve, reject) => {
  RFP.findOne(query)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})
/**
   * Get All RFP
  */
 module.exports.getAllRFP = (skip,limit) => new Promise((resolve, reject) => {
  RFP.find({})
    .skip(skip)
    .limit(limit)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})