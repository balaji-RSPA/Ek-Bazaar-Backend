const mongoose = require('mongoose');
// const conn = require('../../config/tenderdb')
const { Schema, Types } = mongoose;
const { ObjectId } = Types;
const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
// const { model } = conn

// const bcrypt = require('bcrypt');
// const { bcryptSalt } = require('../utils/globalConstants');
// const { validateEmail, validatePhone } = require('../utils/validation')
// const userPlans = require('./userPlans')

const changePassword = new Schema({
  token: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: null
  }
});

const hashCode = new Schema({
  iv: {
    type: String,
    trim: true
  },
  encryptedData: {
    type: String,
    trim: true
  }
})

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: false// 'Name is required'
  },
  countryCode: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    trim: true,
    required: true,
    unique: true,
    // validate: [validatePhone, 'Please fill a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    sparse: true,
    required: false// 'Email address is required',
    // validate: [validateEmail, 'Please fill a valid email address']
  },
  emailAlerts: {
    type: ObjectId,
    ref: 'emailAlerts'
  },
  password: {
    type: String,
    required: false,
    default: null
  },
  userHash: {
    type: { hashCode },
    trim: true
  },
  isEmailVerified: {
    type: Number,
    default: '1'
  },
  isPhoneVerified: {
    type: Number,
    default: '1'
  },
  // city: {
  //   type: ObjectId,
  //   ref: 'Cities',
  //   required: false,
  //   trim: true
  // },
  // operatingLocation: {
  //   type: ObjectId,
  //   ref: 'States',
  //   default: null,
  //   trim: true
  // },
  company: {
    type: String,
    required: false,
    trim: true
  },
  websiteLink: {
    type: String,
    default: null,
    trim: true
  },
  yearOfExperience: {
    type: Number,
    default: null,
    trim: true
  },
  companyGst: {
    type: String,
    default: null,
    trim: true
  },
  turnover: {
    type: Number,
    default: null,
    trim: true
  },
  // natureOfWork: {
  //   type: ObjectId,
  //   ref: 'natureOfWork',
  //   default: null,
  //   trim: true
  // },
  // preferencesId: [{
  //   type: ObjectId,
  //   ref: 'userPreferences'
  // }],
  // favouriteTendersId: {
  //   type: ObjectId,
  //   ref: 'favoriteTenders'
  // },
  // subscribedTendersId: {
  //   type: ObjectId,
  //   ref: 'subscribedTenders'
  // },
  status: {
    type: Number,
    default: '1'
  },
  changePasswordRequest: {
    type: { changePassword },
    default: null
  },
  // planId: [{
  //   type: ObjectId,
  //   ref: 'userPlans'
  // }],
  trialExtends: {
    type: Number,
    default: null
  },
  preferredLanguage: {
    lang: {
      type: String,
      default: null
    },
    langCode: {
      type: String,
      default: null
    }
  },
  deactivateAccount: {
    status: {
      type: Boolean
    },
    reason: {
      type: String
    },
  },

  deleteTendor: {
    status: {
      type: Boolean
    },
    reason: {
      type: String,
      trim: true
    },
  },
  deleteTrade: {
    status: {
      type: Boolean
    },
    reason: {
      type: String,
      trim: true
    },
  },
  deleteInvestement: {
    status: {
      type: Boolean
    },
    reason: {
      type: String,
      trim: true
    },
  },
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
  source: {
    type: String,
    default: "trade"
  }
}, {
  versionKey: false,
  timestamps: true
});

// hash user password before saving into database
// eslint-disable-next-line func-names
// userSchema.pre('save', function (next) {

//   this.password = bcrypt.hashSync(this.password, bcryptSalt.SALT);
//   next();

// });

// const Users = model('users', userSchema)
module.exports = userSchema;
