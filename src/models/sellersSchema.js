const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
const SellerBusiness = require('./sellerBusinessSchema')
const SellerStatutory = require('./sellerStatutorySchema')
const SellerContact = require('./sellerContactsSchema')
const SellerCompany = require('./sellerCompanySchema')
const SellerEstablishment = require('./sellerEstablishmentSchema')
const SellerProducts = require('./sellerProductListSchema')
const SellerTypes = require('./sellertTypesSchema');
const { identity } = require("lodash");

// const notificationSchema = new Schema({
//   businessInquiries: {
//     type: String,
//     trim: true
//   },
//   buyLeads: {
//     type: String,
//     trim: true
//   },
//   newOfferings: {
//     type: String,
//     trim: true
//   },
//   promotionalCommunication: {
//     type: String,
//     trim: true
//   },
// })

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
const serviceSchema = new Schema({
  name: {
    type: ObjectId,
    ref: SellerTypes,
    default: null
  },
  cities: [{
    city: {
      type: ObjectId,
      ref: City,
      default: null
    },
    state: {
      type: ObjectId,
      ref: State,
      default: null
    },
  }]
})

const telephoneSchema = new Schema({
  telephone: {
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
      // required: true
      default: null
    },
    name: {
      type: String,
      default: null,
      // required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
      default: null
    },
    // mobile: [mobile],
    mobile: {
      type: [mobile],
      default: []
    },
    alternateNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: null,
      // required: true,
    },
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
    sellerVerified: {
      type: Boolean,
      default: false
    },
    paidSeller: {
      type: Boolean,
      default: false
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
    // Array Object
    // sellerType: [serviceSchema],
    sellerType: [{
      type: ObjectId,
      ref: SellerTypes,
      // default: []
    }],
    // Array Object
    // serviceCity:[
    //   {
    //     cityId: Object
    //   },{
    //      cityId: Object
    //   }
    // ],
    busenessId: {
      type: ObjectId,
      ref: SellerBusiness,
      default: null
    },
    statutoryId: {
      type: ObjectId,
      ref: SellerStatutory,
      // ref: SellerCompany,
      default: null
    },
    establishmentId: {
      type: ObjectId,
      ref: SellerEstablishment,
      default: null
    },
    sellerCompanyId: {
      type: ObjectId,
      ref: SellerCompany,
      default: null
    },
    sellerContactId: {
      type: ObjectId,
      ref: SellerContact,
      default: null
    },
    sellerProductId: {
      type: [ObjectId],
      ref: "sellerproducts",
      default: []
    },
    // primaryCatId:{
    //   type: ObjectId,
    //   ref: 'level2',
    //   default: null
    // },
    // sellerNotifications:{notificationSchema},
    notifications: {
      businessInquiries: {
        type: String,
        default: null,
        trim: true
      },
      buyLeads: {
        type: String,
        default: null,
        trim: true
      },
      newOfferings: {
        type: String,
        default: null,
        trim: true
      },
      promotionalCommunication: {
        type: String,
        default: null,
        trim: true
      }
    },
    website: {
      type: String,
      default: null,
      trim: true
    },
    source: {
      type: String,
      default: null,
      trim: true
    },
    profileUpdate: {
      type: Boolean,
      default: false
    },
    flag: {
      type: Number,
      default: 1,
    },
    international: {
      type: Boolean,
      default: false
    },
    telephone: {
      type: [telephoneSchema],
      default: null
    },
    website: {
      type: String,
      default: null
    },
    country: {
      type: Object,
      default: null
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Seller = model("sellers", sellersSchema);
module.exports = Seller;
