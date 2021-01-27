const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const Product = require("./productsSchema");
const Seller = require("./sellersSchema");
const State = require("./statesSchema");
const City = require("./citiesSchema");
const Country = require("./countriesSchema");


const productDetails = new Schema({
  name: {
    type: String,
    trim: true,
    // required: true,
  },
  quantity: {
    type: String,
    trim: true,
    // required: true,
  },
  weight: {
    type: String,
    trim: true
  },
});

const location = new Schema({
  city: {
    type: ObjectId,
    ref: City,
  },
  state: {
    type: ObjectId,
    ref: State,
  },
  country: {
    type: ObjectId,
    ref: Country,
  },
});

const buyerDetails = new Schema({
  name: {
    type: String,
    trim: true,
    // required: true,
  },
  email: {
    type: String,
    trim: true,
    // required: true,
  },
  mobile: {
    type: String,
    trim: true,
    // required: true,
  },
  location: location,
  sellerId: {
    type: ObjectId,
    ref: Seller
  },
});

const rfpSchema = new Schema(
  {
    sellerId: {
      type: [ObjectId],
      ref: Seller,
      // required: true,
    },
    buyerId: {
      type: ObjectId,
      ref: 'buyers',
      // required: true,
    },
    buyerDetails: buyerDetails,
    //  {
    //   type: { buyerDetails },
    //   trim: true,
    // },
    productId: {
      type: ObjectId,
      ref: Product,
      // required: true,
    },
    productDetails: {
      type: { productDetails },
      trim: true,
    },
    requestType: {
      type: Number,
      default: null
    },
    totalCount: {
      type: Number,
      default: 0
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const RFP = model("request_for_proposal", rfpSchema);
module.exports = RFP;
