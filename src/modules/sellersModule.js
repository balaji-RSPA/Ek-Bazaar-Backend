const mongoose = require("mongoose");
const Sellers = require("../models/sellersSchema");
const SellersBusiness = require("../models/sellerBusinessSchema");
const SellersCompany = require("../models/sellerCompanySchema");
const SellersContact = require("../models/sellerContactsSchema");
const SellersEstablishment = require("../models/sellerEstablishmentSchema");
const SelleresProductList = require("../models/sellerProductListSchema");
const SellersStatutory = require("../models/sellerStatutorySchema");

module.exports.checkSellerExistOrNot = (mobile) =>
  new Promise((resolve, reject) => {
    Sellers.find({ mobile })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addSeller = (data) =>
  new Promise((resolve, reject) => {
    Sellers.create(data)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getSeller = (id) =>
  new Promise((resolve, reject) => {
    Sellers.find({ _id: id })
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("contactId")
      .populate("comapanyId")
      .populate("establishmentId")
      .populate("sellerProductId")
      // .populate({
      //   path: 'contactId',
      //   populate: {
      //     path: 'location',
      //     populate: {
      //       path: 'city',
      //       model: 'cities'
      //     },
      //     populate: {
      //       path: 'state',
      //       model: 'states'
      //     },
      //     populate: {
      //       path: 'country',
      //       model: 'countries'
      //     }
      //   }
      // })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getAllSellers = () =>
  new Promise((resolve, reject) => {
    Sellers.find({})
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("contactId")
      .populate("comapanyId")
      .populate("establishmentId")
      .populate("sellerProductId")
      .populate('location.city', 'name')
      .populate('location.state', 'name')
      .populate('location.country', 'name')
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateSeller = (id, data) =>
  new Promise((resolve, reject) => {
    Sellers.findOneAndUpdate({ _id: id }, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addbusinessDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersBusiness.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addCompanyDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersCompany.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addContactDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersContact.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addEstablishmentPhotos = (id, data) =>
  new Promise((resolve, reject) => {
    SellersEstablishment.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addProductDetails = (id, data) =>
  new Promise((resolve, reject) => {
    // SelleresProductList.findOneAndUpdate(
    //   { sellerId },
    //   { $set: data },
    //   { new: true, upsert: true }
    // )
    SelleresProductList.create(data)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addStatutoryDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersStatutory.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateSellerPassword = (mobile, data) =>
  new Promise((resolve, reject) => {
    Sellers.findOneAndUpdate({ mobile }, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
