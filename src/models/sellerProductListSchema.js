const mongoose = require("mongoose");
// const { Countries, States} = require('../models')
const Countries = require("./countriesSchema");
const States = require("./statesSchema");
const ParentCategory = require('./parentCategorySchema')
const PrimaryCategory = require('./primaryCategorySchema')
const SecondaryCategory = require('./secondaryCategorySchema')
const Products = require('./productsSchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const documentSchema = new Schema({
  name: {
    type: String,
  },
  code: {
    type: String,
    trim: true,
  },
});

const productDetailsSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  minmumOrderQty: {
    type: Number,
  },
  deliveryTime: {
    type: Date,
    default: null,
  },
  packagingDetails: {
    type: String,
    trim: true,
  },
  countryOfOrigin: {
    type: ObjectId,
    ref: Countries,
    default: null,
  },
  regionOfOrigin: {
    type: ObjectId,
    ref: States,
    default: null,
  },
  productDescription: {
    type: String,
    trim: true,
  },
  inStock: {
    type: String,
    trim: true,
  },
  document: { documentSchema },
});

const sellerProductSchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    serviceType: {
      type: ObjectId,
      trim: true,
      default: null
    },
    parentCategoryId: {
      type: ObjectId,
      ref: ParentCategory,
      default: null,
    },
    primaryCategoryId: {
      type: ObjectId,
      ref: PrimaryCategory,
      default: null,
    },
    secondaryCategoryId: {
      type: ObjectId,
      ref: SecondaryCategory,
      default: null,
    },
    poductId: {
      type: ObjectId,
      ref: Products,
      default: null,
    },
    productDetails: { productDetailsSchema },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerProducts = model("sellerProducts", sellerProductSchema);
module.exports = SellerProducts;
