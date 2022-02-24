const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require('./sellersSchema')

const paymentSchema = new Schema({
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
    paymentDetails: {
        type: Object,
    },
    orderId: {
        type: ObjectId
    },
    paymentResponse: {
        type: Object
    },
    paymentSuccess: {
        type: Boolean,
        default: null
    },
    isSubscription: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
})

const Payments = model('payments', paymentSchema)
module.exports = Payments;