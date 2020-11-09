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
    Buyers.find({ userId: id })
      .then((doc) => {
        // console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyer = (query, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate(query, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getAllBuyers = () =>
  new Promise((resolve, reject) => {
    Buyers.find({})
      .then((doc) => {
        console.log(doc);
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
