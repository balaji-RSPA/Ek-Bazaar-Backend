const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
const RFP = require("./rfpSchema");

const notificationSchema = new Schema({
  sellerLeads: {
    type: String,
    trim: true
  },
  newOfferings: {
    type: String,
    trim: true
  },
  promotionalCommunication: {
    type: String,
    trim: true
  }
})

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
    // required: true,
  },
});

const buyerSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true
    },
    name: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: null,
      // required: true,
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
    alternateNumber: {
      type: String,
      trim: true,
    },
    // password: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    isEmailVerified: {
      type: Boolean,
      default: false,
      // required: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      // required: true
    },
    location: {
      type: { location },
      trim: true,
    },
    notifications:{
      type: {notificationSchema}
    },
    rfpId: {
      type: [ObjectId],
      ref: RFP,
    },
    deactivateAccount: {
      status: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Buyer = model("buyers", buyerSchema);
module.exports = Buyer;
