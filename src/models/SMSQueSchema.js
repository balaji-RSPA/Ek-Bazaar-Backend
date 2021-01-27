const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Buyer = require('./buyersSchema')
const Seller = require('./sellersSchema')
const RFP = require('./rfpSchema')

const smsQueSchema = new Schema({

    sellerId: {
        type: ObjectId,
        ref: Seller
    },
    buyerId: {
        type: ObjectId,
        ref: Buyer
    },
    mobile: {
        type: Object,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    requestId: {
        type: ObjectId,
        ref: RFP,
        default: null
    }

}, {
    timestamps: true,
    versionKey: false,
})

const SMSQue = model("smsques", smsQueSchema);
module.exports = SMSQue;