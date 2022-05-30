const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const paymentFailed = new Schema(
    {
        paymentFailedHookResponse: {
            type: Object,
            default: null
        },
        uniqueEventId: {
            type: String,
            unique: true,
            required: true
        },
        oprated: {
            type: Boolean,
            default: false
        }
    }, {
    timestamps: true,
    versionKey: false,
}
);

const PaymentFailedHook = model('payment_failed_hook_res', paymentFailed)
module.exports = PaymentFailedHook