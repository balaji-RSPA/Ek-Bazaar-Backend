const mongoose = require("mongoose");
// const Seller = require('./sellersSchema')
const State = require('./statesSchema')
const Country = require('./countriesSchema')
const City = require('./citiesSchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const location = new Schema({
    address: {
        type: String,
        trim: true
    },
    city: {
        type: ObjectId,
        ref: City,
        trim: true,
        required: true,
    },
    state: {
        type: ObjectId,
        ref: State,
        trim: true,
        required: true,
    },
    country: {
        type: ObjectId,
        ref: Country,
        trim: true,
        required: true,
    },
    pincode: {
        type: String,
        trim: true
    }
});

const sellerContactSchema = new Schema(
  {
      sellerId: {
        type: ObjectId,
        ref: 'sellers',
        default: null
      },
      alternativNumber: {
          type: String,
          trim: true
      },
      location:{ location }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerContact = model('sellercontacts', sellerContactSchema)
module.exports = SellerContact