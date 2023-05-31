const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

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
    required: false
  },
  mobile: {
    type: Number,
    trim: true,
    required: false,
    unique: false,
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
    // ref: 'emailAlerts'
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
  city: {
    type: ObjectId,
    // ref: 'Cities',
    required: false,
    trim: true
  },
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
  preferencesId: [{
    type: ObjectId,
    // ref: 'userPreferences'
  }],
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
  planId: [{
    type: ObjectId,
    // ref: 'userPlans'
  }],
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
  isMobileApp: {
    type:Boolean,
    default:false
  },
  isWhatsappApp: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false,
  timestamps: true
});

module.exports = userSchema;
