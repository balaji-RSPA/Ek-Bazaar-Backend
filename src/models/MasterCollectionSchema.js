const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const nameSchema = new Schema(
    {
        name: {
            type: String,
            default: null,
            lowercase: true
        },
        _id: {
            type: ObjectId
        }
    }
)

const documentSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    code: {
        type: String,
        trim: true,
    },
});

const productDetailsSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    price: {
        price: {
            type: String,
            trim: true,
            // default: null
        },
        unit: {
            type: String,
            trim: true,
            // default: null
        }
    },
    minmumOrderQty: {
        quantity: {
            type: String,
            trim: true,
            // default: null
        },
        unit: {
            type: String,
            trim: true,
            // default: null
        }
    },
    deliveryTime: {
        deliveryTime: {
            type: String,
            trim: true,
            // default: null
        },
        unit: {
            type: String,
            trim: true,
            // default: null
        }
    },
    packagingDetails: {
        type: Object,
        default: null
        // packagingDetail: {
        //     type: String,
        //     trim: true,
        //     // default: null
        // },
        // packagingUnit: {
        //     type: String,
        //     trim: true,
        //     // default: null
        // }
    },
    countryOfOrigin: {
        type: nameSchema,
        // default: null
    },
    regionOfOrigin: {
        type: nameSchema,
        // default: null
    },
    cityOfOrigin: {
        type: nameSchema,
    },
    sellingCountries: {
        type: [nameSchema]
    },
    sellingStates: {
        type: [nameSchema]
    },
    sellingCities: {
        type: [nameSchema]
    },
    productDescription: {
        type: String,
        trim: true,
    },
    inStock: {
        type: Boolean,
        trim: true,
    },
    document: documentSchema,
    documentName: {
        type: String,
        trim: true
    },
    image: {
        image1: {
            name: {
                type: String,
                trim: true,
                // default: null
            },
            code: {
                type: String,
                trim: true,
                // default: null
            },
        },
        image2: {
            name: {
                type: String,
                trim: true,
                // default: null
            },
            code: {
                type: String,
                trim: true,
                // default: null
            },
        },
        image3: {
            name: {
                type: String,
                trim: true,
                // default: null
            },
            code: {
                type: String,
                trim: true,
                // default: null
            },
        },
        image4: {
            name: {
                type: String,
                trim: true,
                // default: null
            },
            code: {
                type: String,
                trim: true,
                // default: null
            },
        }
    }
});

const serviceCitiesSchema = new Schema({
    city: {
        type: nameSchema,
        default: null
    },
    state: {
        type: nameSchema,
        default: null
    },
    country: {
        type: nameSchema,
        default: null
    }
})
const categorySchema = new Schema({
    name: {
        type: String,
        default: null,
        lowercase: true
    },
    vendorId: {
        type: String,
        default: null
    },
    _id: {
        type: ObjectId,
        default: null
    }
})

const mobileSchema = new Schema({
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


const masterCollectionSchema = new Schema(
    {
        sellerId: {
            _id: {
                type: ObjectId,
                ref: 'sellers'
            },
            name: {
                type: String,
                default: null,
                lowercase: true
            },
            email: {
                type: String,
                default: null
            },
            location: {
                city: {
                    type: nameSchema,
                    default: null
                },
                state: {
                    type: nameSchema,
                    default: null
                },
                country: {
                    type: nameSchema,
                    default: null
                },
                address: {
                    type: String,
                    default: null
                },
                pincode: {
                    type: String,
                    default: null
                }
            },
            sellerType: {
                type: Array,
                default: null
            },
            mobile: {
                type: [mobileSchema],
                default: null
            },
            source: {
                type: String,
                default: null
            },
            website: {
                type: String,
                default: null
            },
            isEmailVerified: {
                type: Boolean,
                default: false
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
            international: {
                type: Boolean,
                default: false
            },
            telephone: {
                type: [telephoneSchema],
                default: null
            },
            country: {
                type: Object,
                default: null
            },
            status: {
                type: Boolean,
                default: true
            },
            deactivateAccount: {
                type: Boolean,
                default: false
            },
            businessName: {
                type: String,
                default: null
            },
            planExpired: {
                type: Boolean,
                default: false
            },
            planExpireDate: {
                type: Date
            }
        },
        priority: {
            type: Number
        },
        userId: {
            type: nameSchema,
            default: null,
        },
        serviceType: {
            type: [nameSchema],
            // ref: "sellerTypes",
            default: null
        },
        parentCategoryId: {
            type: [categorySchema],
            default: null
        },
        primaryCategoryId: { // level 2 
            type: [categorySchema],
            default: null
        },
        secondaryCategoryId: { // level 3
            type: [categorySchema],
            default: null
        },
        poductId: { // level 4
            type: [categorySchema],
            default: null
        },
        productSubcategoryId: { // level 5
            type: [categorySchema],
            default: null
        },

        productDetails: {
            type: productDetailsSchema,
            default: null
        },

        serviceCity: {
            type: [serviceCitiesSchema],
            default: null
        },
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
            default: null,
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

masterCollectionSchema.index({
    'userId._id': 1
})


const MasterCollection = model('mastercollections', masterCollectionSchema);
module.exports = MasterCollection;
// module.exports = masterCollectionSchema;
