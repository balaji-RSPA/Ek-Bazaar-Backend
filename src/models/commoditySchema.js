const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");
const Countries = require("./countriesSchema")

const commoditySchema = new Schema(
  {
    commodityName: {
      type: String,
      required: true,
      trim: true
    },
    veriety: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      // required: true,
      trim: true
    },
    priceUnit: {
      type: String,
      required: true,
      trim: true
    },
    parentCat: {
      type: Number,
      // required: true,
      trim: true
    },
    commCat: {
      type: Number,
      // required: true,
      trim: true
    },
    active:{
      type: Boolean,
      default:false
    },
    city: [
      {
        city: {
          type: ObjectId,
          ref: City
        },
        price: {
          type: Number
        }
      }
    ],
    country: [
      {
        country: {
          type: ObjectId,
          ref: Countries
        }
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Commodity = model("commodity", commoditySchema);
module.exports = Commodity;
