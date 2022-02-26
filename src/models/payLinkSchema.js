const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const payLinkGenSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true,
    },
    sellerId: {
        type: ObjectId,
        required: true
    },
    isSubscription: {
        type: Boolean,
        default: false
    },
    subscriptionpId: {
        type: ObjectId,
        required: true
    },
    currency: {
        type: String,
        default:'INR',
        required: true
    },
    orderDetails: {
        type: Object,
        required: true
    },
    razorPay: {
        type: Object,
        default: {},
        required: true
    }
},{
    versionKey: false,
    timestamps: true
})

const Paylinks = model('paylinks', payLinkGenSchema);
module.exports = Paylinks;