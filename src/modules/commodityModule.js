const { Commodity } = require("../models");

/**create Commodity*/
module.exports.createCommodity = commodityData =>
  new Promise((resolve, reject) => {
    Commodity.create(commodityData)
      .then(commodity => {
        resolve(commodity);
      })
      .catch(error => reject(error));
  });

/**get all commodity*/
module.exports.getAllCommodity = (searchQuery) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery.search
      ? searchQuery.search
      : {};

    Commodity.find(searchQry)
      .skip(searchQuery.skip)
      .limit(searchQuery.limit)
      .sort({ updatedAt: -1 })
      .populate("city.city")
      .then(commodityData => {
        resolve(commodityData);
      })
      .catch(error => reject(error));
  });

/**get specific Commodity*/
module.exports.getCommodity = query =>
  new Promise((resolve, reject) => {
    Commodity.findOne(query)
      .populate("city.city")
      .then(commodityData => {
        resolve(commodityData);
      })
      .catch(error => reject(error));
  });

/**update Commodity*/
module.exports.updateCommodity = (query, updatedData) =>
  new Promise((resolve, reject) => {
    Commodity.findOneAndUpdate(query, updatedData, {
      new: true
    })
      .then(updated => {
        resolve(updated);
      })
      .catch(error => reject(error));
  });

/**delete Commodity*/
module.exports.deleteCommodity = query =>
  new Promise((resolve, reject) => {
    Commodity.deleteMany(query)
      .then(deleted => {
        resolve(deleted);
      })
      .catch(error => reject(error));
  });
