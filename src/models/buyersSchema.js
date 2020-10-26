const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
const RFP = require("./rfpSchema");

const location = new Schema({
  city: {
    type: ObjectId,
    ref: City,
    required: true,
  },
  state: {
    type: ObjectId,
    ref: State,
    required: true,
  },
  country: {
    type: ObjectId,
    ref: Country,
    required: true,
  },
});

const buyerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: { location },
      trim: true,
    },
    rfpId: {
      type: [ObjectId],
      ref: RFP,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Buyer = model("buyers", buyerSchema);
module.exports = Buyer;
