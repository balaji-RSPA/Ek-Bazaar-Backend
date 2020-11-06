const { Buyers } = require("../models");

module.exports.checkBuyerExistOrNot = (mobile) =>
  new Promise((resolve, reject) => {
    Buyers.find({ mobile })
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
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyer = (id, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate({ userId: id }, data, { new: true })
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
