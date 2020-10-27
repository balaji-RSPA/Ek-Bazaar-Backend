const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const Product = require("./productsSchema");
const Seller = require("./sellersSchema");

const productDetails = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  quantity: {
    type: String,
    trim: true,
    required: true,
  },
});

const location = new Schema({
  city: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  country: {
    type: String,
    trim: true,
    required: true,
  },
});

const buyerDetails = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  mobile: {
    type: String,
    trim: true,
    required: true,
  },
  location: {
    type: { location },
    trim: true,
  }
});

const rfpSchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: Seller,
      required: true,
    },
    buyerId: {
      type: ObjectId,
      ref: 'buyers',
      required: true,
    },
    buyerDetails: {
      type: { buyerDetails },
      trim: true,
    },
    productId: {
      type: ObjectId,
      ref: Product,
      required: true,
    },
    productDetails: {
      type: { productDetails },
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const RFP = model("request_for_proposal", rfpSchema);
module.exports = RFP;
