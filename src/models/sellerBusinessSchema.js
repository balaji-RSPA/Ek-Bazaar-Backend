const mongoose = require("mongoose");
// const Seller = require('./sellersSchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const sellerBusinessSchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfEstablishment: {
      type: Date,
      sparse: true,
      default: null,
    },
    promotorName: {
      type: String,
      //   required: true,
      trim: true,
    },
    designation: {
      type: String,
      //   required: true,
      trim: true,
    },
    alternateNumber: {
      type: String,
      trim: true,
    },
    businesType: {
      type: String,
      trim: true,
    },
    ownershipType: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerBusiness = model("sellerbusiness", sellerBusinessSchema);
module.exports = SellerBusiness;
