const mongoose = require("mongoose");
// const { Countries, States} = require('../models')
const Countries = require("./countriesSchema");
const States = require("./statesSchema");
const ParentCategory = require('./parentCategorySchema')
const PrimaryCategory = require('./primaryCategorySchema')
const SecondaryCategory = require('./secondaryCategorySchema')
const Products = require('./productsSchema');
const ProductsSubCategories = require("./productsSubCategoriesSchema");
const City = require('./citiesSchema')
const State = require('./statesSchema')
const SellerTypes = require('./sellertTypesSchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const documentSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    default: null,
  }
});

// const imageSchema = new Schema({
//   image1:{
//     name: {
//       type: String,
//       trim: true,
//       default: null
//     },
//     code: {
//       type: String,
//       trim: true,
//       default: null
//     },
//   },
//   image2 : {
//     name: {
//       type: String,
//       trim: true,
//       default: null
//     },
//     code: {
//       type: String,
//       trim: true,
//       default: null
//     },
//   },
//   image3:{
//     name: {
//       type: String,
//       trim: true,
//       default: null
//     },
//     code: {
//       type: String,
//       trim: true,
//       default: null
//     },
//   },
//   image4:{
//     name: {
//       type: String,
//       trim: true,
//       default: null
//     },
//     code: {
//       type: String,
//       trim: true,
//       default: null
//     },
//   }
// })

const offerSchema = new Schema({
  price: {
    price: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  },
  qty: {
    qty: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  },
  location: {
    city: {
      label: {
        type: String
      },
      value: {
        type: ObjectId
      }
    },
    state: {
      label: {
        type: String
      },
      value: {
        type: ObjectId
      }
    }
  },
  validity: {
    fromDate: {
      type: Date
    },
    toDate: {
      type: Date
    }
  }
})

const productDetailsSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  price: {
    price: {
      type: String,
      trim: true,
      default: null
    },
    unit: {
      type: String,
      trim: true,
      default: null
    }
  },
  minmumOrderQty: {
    quantity: {
      type: String,
      trim: true,
      default: null
    },
    unit: {
      type: String,
      trim: true,
      default: null
    }
  },
  deliveryTime: {
    deliveryTime: {
      type: String,
      trim: true,
      default: null
    },
    unit: {
      type: String,
      trim: true,
      default: null
    }
  },
  packagingDetails: {
    type: Object,
    default: null
    // packagingDetail: {
    //   type: String,
    //   trim: true,
    //   default: null
    // },
    // packagingUnit: {
    //   type: String,
    //   trim: true,
    //   default: null
    // }
  },
  // packagingDetails: Object,
  countryOfOrigin: {
    type: ObjectId,
    ref: Countries,
    default: null,
  },
  regionOfOrigin: {
    type: ObjectId,
    ref: States,
    default: null,
  },
  cityOfOrigin: {
    type: ObjectId,
    ref: City,
    default: null,
  },
  others: {
    type: String
  },
  sellingCountries: [{
    type: ObjectId,
    ref: Countries,
    // default: ,
  }],
  sellingStates: [{
    type: ObjectId,
    ref: States,
    // default: [],
  }],
  sellingCities: [{
    type: ObjectId,
    ref: City,
    // default: [],
  }],
  productDescription: {
    type: String,
    trim: true,
  },
  inStock: {
    type: Boolean,
    trim: true,
  },
  shelfLife: {
    shelfLife: {
      type: String,
      trim: true,
      default: null
    },
    unit: {
      type: String,
      trim: true,
      default: null
    }
  },
  isOrganic: {
    type: Boolean,
    trim: true,
  },
  document: documentSchema,
  documentName: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    image1: {
      name: {
        type: String,
        trim: true,
        default: null
      },
      code: {
        type: String,
        trim: true,
        default: null
      },
    },
    image2: {
      name: {
        type: String,
        trim: true,
        default: null
      },
      code: {
        type: String,
        trim: true,
        default: null
      },
    },
    image3: {
      name: {
        type: String,
        trim: true,
        default: null
      },
      code: {
        type: String,
        trim: true,
        default: null
      },
    },
    image4: {
      name: {
        type: String,
        trim: true,
        default: null
      },
      code: {
        type: String,
        trim: true,
        default: null
      },
    }
  }
});

const serviceCitiesSchema = new Schema({
  city: {
    type: ObjectId,
    ref: City,
    default: null
  },
  state: {
    type: ObjectId,
    ref: States,
    default: null
  },
  country: {
    type: ObjectId,
    ref: Countries,
    default: null
  },
  region: {
    type: String,
    default: null
  }
})

const sellerProductSchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    userId: {
      type: ObjectId,
      default: null,
    },
    serviceType: {
      type: ObjectId,
      ref: SellerTypes,
      trim: true,
      default: null
    },
    parentCategoryId: [{ // level 1
      type: ObjectId,
      ref: ParentCategory,
      default: null,
    }],
    primaryCategoryId: [{ // level 2 
      type: ObjectId,
      ref: PrimaryCategory,
      default: null,
    }],
    secondaryCategoryId: [{ // level 3
      type: ObjectId,
      ref: SecondaryCategory,
      default: null,
    }],
    poductId: [{ // level 4
      type: ObjectId,
      ref: Products,
      default: null,
    }],
    productSubcategoryId: [{ // level 5
      type: ObjectId,
      ref: ProductsSubCategories,
      default: null
    }],

    productDetails: {
      type: productDetailsSchema,
      default: null
    },
    offers: {
      type: offerSchema
    },
    serviceCity: [serviceCitiesSchema],
    status: {
      type: Boolean,
      default: true
    },
    keywords: {
      type: Array,
      default: null
    },
    flag: {
      type: Number,
      default: 1,
    },
    batch: {
      type: Number,
      default: 1
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sellerProductSchema.index({
  // sellerId:1
  flag: 1,
  batch: 1
})

const SellerProducts = model("sellerproducts", sellerProductSchema);
module.exports = SellerProducts;
