const { Commodity } = require("../models");

module.exports.createCommodity = commodityData =>
  new Promise((resolve, reject) => {
    Commodity.create(commodityData)
      .then(commodity => {
        resolve(commodity);
      })
      .catch(error => reject(error));
  });

module.exports.getAllCommodity = () =>
  new Promise((resolve, reject) => {
    Commodity.find()
      .then(commodityData => {
        resolve(commodityData);
      })
      .catch(error => reject(error));
  });

module.exports.getCommodity = query =>
  new Promise((resolve, reject) => {
    Commodity.findOne(query)
      .then(commodityData => {
        resolve(commodityData);
      })
      .catch(error => reject(error));
  });

module.exports.updateCommodity = (query, updatedData) =>
  new Promise((resolve, reject) => {
    console.log({ updatedData });

    Commodity.findOneAndUpdate(query, updatedData, {
      new: true
    })
      .then(updated => {
        resolve(updated);
      })
      .catch(error => reject(error));
  });

module.exports.deleteCommodity = query =>
  new Promise((resolve, reject) => {
    Commodity.deleteOne(query)
      .then(deleted => {
        resolve(deleted);
      })
      .catch(error => reject(error));
  });
