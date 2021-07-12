const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const sellerPlanLogSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        default: null
    },
    sellerId: {
        type: ObjectId,
        ref: 'sellers',
        // required: true
    },
    sellerPlanId: {
        type: ObjectId,
        // required: true
    },
    subscriptionId: {
        type: ObjectId,
        // required: true
    },
    sellerDetails: {
        type: Object,
        // required: true
    },
    planDetails: {
        type: Object,
        // required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

const SellerPlanLog = model('sellerplanlogs', sellerPlanLogSchema)
module.exports = SellerPlanLog;