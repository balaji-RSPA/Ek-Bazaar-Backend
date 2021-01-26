const {
  Buyers,
  RFP
} = require("../models");
const User = require('../../config/tenderdb').userModel
module.exports.postRFP = (data) => new Promise((resolve, reject) => {
  RFP.create(data)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))

})

module.exports.checkBuyerExistOrNot = (query) =>
  new Promise((resolve, reject) => {
    Buyers.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addBuyer = (data) =>
  new Promise((resolve, reject) => {
    Buyers.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getBuyer = (id) =>
  new Promise((resolve, reject) => {
    Buyers.findOne({ userId: id })
      .populate({
        path: "location.city",
        model: "cities",
        select: "name"
      })
      .populate({
        path: "location.state",
        model: "states",
        select: "name"
      })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyer = (query, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate(query, data, { new: true, upsert: true })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getAllBuyers = (searchQuery, skip, limit) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery ? {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { mobile: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};
    Buyers.find(searchQry)
      .skip(skip)
      .limit(limit)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyerPassword = (mobile, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate({ mobile }, data, { new: true })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
/*Buyer admin api*/
module.exports.getBuyerAdmin = (query) =>
  new Promise((resolve, reject) => {
    Buyers.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
/**
   * Create RFP
  */
module.exports.postRFP = (data) => new Promise((resolve, reject) => {
  RFP.create(data)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))

})
/**
 * Get Specific RFP
 */
module.exports.getRFP = (query) => new Promise((resolve, reject) => {
  RFP.find(query)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})
/**
 * 
 * Email verification code  
 */
exports.getUserFromUserHash = (hashcode) => new Promise((resolve, reject) => {
  User.find({
      "userHash.encryptedData": hashcode
    }, {
      _id: 0,
      userHash: 1,
      mobile:1
    })
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})

exports.updateEmailVerification = (hash, newData) => new Promise((resolve, reject) => {
  User.update({
      'userHash.encryptedData': hash
    }, {
      $set: {
        isEmailVerified: 2,
        email: newData.userEmail
      }
    }, {
      new: true
    })
    .then((doc) => resolve(doc))
    .catch(reject)
})