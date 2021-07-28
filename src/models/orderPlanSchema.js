const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require('./sellersSchema')
const SubscriptionPlan = require('./subscriptionPlanSchema')

const orderPlanSchema = new Schema({
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
    orderId: {
        type: ObjectId,
        required: true
    },
    subscriptionId: {
        type: ObjectId,
        ref: SubscriptionPlan,
        default: null
    },
    type: { //Quarterly,Yearly,Full Bazaar
        type: String,
        trim: true,
        required: true
    },
    planType: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    usdPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: null
    },
    priceUnit: { //month,year
        type: String,
        required: true
    },
    popularity: { //Most Popular, popular, less popular
        type: String,
        // required: true
    },
    billingType: { //billed quarterly,billed yearly,billed monthly
        type: String,
        required: true
    },
    days: {
        type: String,
        required: true
    },
    features: {
        type: String,
        required: true
    },
    exprireDate: {
        type: Date,
        default: null
    }
}, {
    versionKey: false,
    timestamps: true
})

const OrdersPlans = model('orderplans', orderPlanSchema)
module.exports = OrdersPlans;