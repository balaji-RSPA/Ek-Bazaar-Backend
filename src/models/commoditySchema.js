const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");

const commoditySchema = new Schema(
  {
    commodityName: {
      type: String,
      required: true,
      trim: true
    },
    priceUnit: {
      type: String,
      required: true,
      trim: true
    },
    cities: [
      {
        city: {
          type: ObjectId,
          ref: City
        },
        price: {
          type: Number
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
