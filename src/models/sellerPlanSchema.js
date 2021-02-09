const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const sellerPlanSchema = new Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    sellerId: {
        type: ObjectId,
        ref: 'sellers',
        default: null
    },
    userId: {
        type: ObjectId,
        // ref: 'users',
        default: null
    },
    description: {
        type: String,
        trim: true,
        require: true
    },
    features: {
        type: String
    },
    days: {
        type: Number,
        trim: true
    },
    status: {
        type: Number,
        default: '1'
    },
    exprireDate: {
        type: Date
    },
    expireStatus: {
        type: Boolean,
        default: false
    },
    isTrial: {
        type: Boolean,
        default: false
    },
    planType: {
        type: String,
        default: null
    },
    extendTimes: {
        type: Number,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    extendDays: {
        type: Array,
        default: null
    },
    subscriptionId: {
        type: ObjectId,
        ref: 'subscriptionPlan'
    },
    groupType: {
        type: Number
    },
    createdOn: {
        type: Date,
        default: new Date()
    }
}, {
    versionKey: false,
    timestamps: true
})

const SellerPlans = model('sellerplans', sellerPlanSchema)
module.exports = SellerPlans;
