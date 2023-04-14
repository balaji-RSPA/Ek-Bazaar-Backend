const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const strippayLinkGenSchema = new Schema({
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
    subscriptionId: {
        type: ObjectId,
        required: true
    },
    currency: {
        type: String,
        default: 'USD',
        required: true
    },
    orderDetails: {
        type: Object,
        required: true
    },
    isSubLink: {
        type: Object,
        required: true
    },
    product: {
        type: Object,
        default: {},
        required: true
    },
    paymentLink: {
        type: Object,
        default: {}
    }
}, {
    versionKey: false,
    timestamps: true
})

const StripPaylinks = model('paylink_strip', strippayLinkGenSchema);
module.exports = StripPaylinks;