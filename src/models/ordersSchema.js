const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const City = require("./citiesSchema");
const State = require("./statesSchema");
const Country = require("./countriesSchema");
const OrdersPlans = require('./orderPlanSchema')
const SubscriptionPlan = require('./subscriptionPlanSchema')
const SellerPlans = require('./sellerPlanSchema')
const Seller = require('./sellersSchema')
const SellerTypes = require('./sellertTypesSchema')

const location = new Schema({
    city: {
        type: ObjectId,
        ref: City,
    },
    state: {
        type: ObjectId,
        ref: State,
    },
    country: {
        type: ObjectId,
        ref: Country,
        // required: true,
    },
});

const sellerDetailsSchema = new Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    mobile: {
        countryCode: {
            type: String,
            default: null
        },
        mobile: {
            type: String,
            default: null
        }
    },
    location: {
        type: location,
        default: null
    },
    sellerType: {
        type: [ObjectId],
        ref: SellerTypes,
        default: null
    },
    groupId: {
        type: Number,
        default: null
    }
})


const orderSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        default: null
    },
    sellerId: {
        type: ObjectId,
        ref: Seller,
        required: true
    },
    invoiceNo: {
        type: String,
        default: null
    },
    invoicePath: {
        type: String,
        default: null
    },
    gstNo: {
        type: String,
        default: null
    },
    sellerDetails: {
        type: Object/* sellerDetailsSchema */,
        default: null
    },
    sellerPlanId: {
        type: ObjectId,
        ref: SellerPlans,
        default: null
    },
    subscriptionId: {
        type: ObjectId,
        ref: SubscriptionPlan,
        default: null
    },
    orderPlanId: {
        type: [ObjectId],
        ref: OrdersPlans,
        // required: true
    },
    price: {
        type: Number,
        default: null
    },
    gstAmount: {
        type: Number,
        default: null
    },
    total: {
        type: Number,
        default: null
    },
    orderedOn: {
        type: Date,
        default: new Date()
    },
    paymentId: {
        type: ObjectId,
        // required: true
    },
    paymentStatus: {
        type: Boolean,
        default: true
    },
    ipAddress: {
        type: String,
        default: null
    },
    isEmailSent: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
})

const Orders = model('orders', orderSchema)
module.exports = Orders;