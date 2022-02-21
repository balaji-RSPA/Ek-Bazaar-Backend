const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const paymentDataSchema = Schema(
    {
        sellerId: {
            type: ObjectId,
            required: true
        },
        subscriptionId: {
            type: ObjectId,
            required: true
        },
        userId: {
            type: ObjectId,
            required: true
        },
        orderDetails: {
            type: Object,
            required: true
        },
        paymentResponse: {
            type: Object,
            required: true
        },
        paymentId: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        },
        purchagId: {
            type: String,
            required: true
        },
        isSubscription: {
            type: Boolean,
            required: true
        },
        originUrl: {
            type: String,
            required: true
        }
    }, {
    timestamps: true,
    versionKey: false,
    }
);

const PaymentData = model('paymentData', paymentDataSchema);
module.exports = PaymentData;