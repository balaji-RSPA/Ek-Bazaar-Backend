const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require('./sellersSchema');
const SubscriptionPlan = require('./subscriptionPlanSchema')

const pendingSubscriptionOrder = new Schema({
    sellerId: {
        type: ObjectId,
        ref: Seller,
        required: true
    },
    userId: {
        type: ObjectId,
        ref: 'users',
        default: null
    },
    subscriptionId: {
        type: ObjectId,
        ref: SubscriptionPlan,
        default: null
    },
    orderDetails: {
        type: Object,
        default: null
    },
    paymentResponse: {
        type: Object,
        required: true
    },
    currency: {
        type: String,
        default: null
    },
    isSubscription: {
        type: Boolean,
        default: false
    },
    rzrPaymentId: {
        type: String,
        required: true
    },
    rzrSubscriptionId: {
        type: String,
        required: true
    },
    pending: {
        type: Boolean,
        required: true
    },
    OrderId:{
        type: ObjectId,
        default: null
    },
    PaymentId:{
        type: ObjectId,
        default: null
    }


}, {
    versionKey: false,
    timestamps: true
})

const pendingSubOrders = model('pending_sub_orders', pendingSubscriptionOrder)
module.exports = pendingSubOrders;