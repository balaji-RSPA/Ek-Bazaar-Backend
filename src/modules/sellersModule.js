const mongoose = require("mongoose");
const Sellers = require("../models/sellersSchema");
const SellersBusiness = require("../models/sellerBusinessSchema");
const SellersCompany = require("../models/sellerCompanySchema");
const SellersContac = require("../models/sellerContactsSchema");
const SellersEstablishment = require("../models/sellerEstablishmentSchema");
const SelleresProductList = require("../models/sellerProductListSchema");
const SellersStatutory = require("../models/sellerStatutorySchema");

module.exports.addSeller = (data) =>
  new Promise((resolve, reject) => {
    Sellers.create(data)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateSeller = (id, data) =>
  new Promise((resolve, reject) => {
    Sellers.findOneAndUpdate(id, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
