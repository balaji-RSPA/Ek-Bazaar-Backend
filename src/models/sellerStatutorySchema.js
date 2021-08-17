const mongoose = require("mongoose");
// const Seller = require('./sellersSchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const companySchema = new Schema({
  number: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
  },
});

const sellerStatutorySchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    company: {
      type: { companySchema },
    },
    CinNumber: {
      type: String,
      trim: true,
    },
    GstNumber: {
      type: { companySchema },
    },
    IeCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerStatutory = model("sellerStatutory", sellerStatutorySchema);
module.exports = SellerStatutory;
