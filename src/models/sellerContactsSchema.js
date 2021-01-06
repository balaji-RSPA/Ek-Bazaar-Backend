const mongoose = require("mongoose");
// const Seller = require('./sellersSchema')
const States = require("./statesSchema");
const Country = require("./countriesSchema");
const Cities = require("./citiesSchema");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const location = new Schema({
  // address: {
  //   type: String,
  //   trim: true,
  // },
  // city: {
  //   type: ObjectId,
  //   ref: City,
  //   trim: true,
  //   // required: true,
  // },
  // state: {
  //   type: ObjectId,
  //   ref: State,
  //   trim: true,
  //   // required: true,
  // },
  // country: {
  //   type: ObjectId,
  //   ref: Country,
  //   trim: true,
  //   // required: true,
  // },
  pincode: {
    type: String,
    trim: true,
  },
});

const sellerContactSchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    alternativNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    location: { 
      pincode: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: ObjectId,
        ref: Cities,
        trim: true,
        // required: true,
      },
      state: {
        type: ObjectId,
        ref: States,
        trim: true,
        // required: true,
      },
      country: {
        type: ObjectId,
        ref: Country,
        trim: true,
        // required: true,
      }
     },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerContact = model("sellercontacts", sellerContactSchema);
module.exports = SellerContact;
