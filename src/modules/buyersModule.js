const { Buyers, RFP } = require("../models");

module.exports.postRFP = (data) => new Promise((resolve, reject) => {
  RFP.create(data)
    .then(doc => {
      console.log(doc)
      resolve(doc)
    })
    .catch(error => reject(error))

})

module.exports.checkBuyerExistOrNot = (query) =>
  new Promise((resolve, reject) => {
    Buyers.find(query)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(Error));
  });

module.exports.addBuyer = (data) =>
  new Promise((resolve, reject) => {
    Buyers.create(data)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getBuyer = (id) =>
  new Promise((resolve, reject) => {
    Buyers.findOne({ userId: id })
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

module.exports.getAllBuyers = (sellerType,searchQuery,skip,limit) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery ? {$or: [
      { name : { $regex: searchQuery, $options: 'i' } },
      { mobile : { $regex: searchQuery, $options: 'i' }}
      ]}  : {};
    // Object.keys(searchQuery).forEach((el)=>{
    //   searchQry[el] = { $regex: `${searchQuery[el]}`, $options: 'i' }
    // })
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
        console.log(doc);
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
   * Get RFP detail
  */
 module.exports.postRFP = (data) => new Promise((resolve, reject) => {
  RFP.create(data)
    .then(doc => {
      console.log(doc)
      resolve(doc)
    })
    .catch(error => reject(error))

})
