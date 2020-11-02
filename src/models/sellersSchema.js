const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
const SellerBusiness =require('./sellerBusinessSchema')
const SellerStatutory = require('./sellerStatutorySchema')
// const SellerContact =require('./sellerContactsSchema')
const SellerCompany = require('./sellerCompanySchema')
const SellerEstablishment = require('./sellerEstablishmentSchema')
const SellerProducts = require('./sellerProductListSchema')
const SellerTypes = require('./sellertTypesSchema')

const location = new Schema({
  city: {
    type: ObjectId,
    ref: City,
    trim: true,
    // required: true,
  },
  state: {
    type: ObjectId,
    ref: State,
    trim: true,
    // required: true,
  },
  country: {
    type: ObjectId,
    ref: Country,
    trim: true,
    // required: true,
  },
  address: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  }
});

const mobile = new Schema({
      mobile: {
        type: String,
        trim: true
      },
      countryCode: {
        type: String,
        trim: true,
        default: null
      }
    })

const sellersSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
      default: null
    },
    // mobile: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    mobile: [mobile],
    password: {
      type: String,
      // required: true,
      trim: true,
    },
    alternateNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      // required: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      // required: true
    },
    location: {
      type: location,
      trim: true,
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
    sellerType: {
      type: ObjectId,
      ref: SellerTypes,
      // required: true
    },
    busenessId: {
      type: ObjectId,
      ref: SellerBusiness,
      default: null
    },
    statutoryId: {
      type: ObjectId,
      ref: SellerStatutory,
      default: null
    },
    /* contactId: {
      type: ObjectId,
      ref: SellerContact,
      default: null
    }, */
    comapanyId: {
      type: ObjectId,
      ref: SellerCompany,
      default: null
    },
    establishmentId: {
      type: ObjectId,
      ref: SellerEstablishment,
      default: null
    },
    sellerProductId:{
      type: [ObjectId],
      ref: SellerProducts,
      default: null
    },
    primaryCatId:{
      type: ObjectId,
      ref: 'primaryCategory',
      default: null
    },
    website: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Seller = model("sellers", sellersSchema);
module.exports = Seller;
