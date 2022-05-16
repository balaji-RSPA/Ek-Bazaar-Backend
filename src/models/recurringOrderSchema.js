const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require('./sellersSchema');
const SellerPlans = require('./sellerPlanSchema')
const moment = require('moment')
const fromDate = moment();

let next_date = moment(fromDate, "YYYY-MM-DD").add(1, 'months');

const recurringSchema = new Schema({
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
    sellerPlanId: {
        type: ObjectId,
        ref: SellerPlans,
        default: null
    },
    invoiceNo: {
        type: [String],
        default: []
    },
    invoicePath: {
        type: [String],
        default: []
    },
    paymentDateLog: {
        type:[String],
        default:[]
    },
    nextPaymentDate: {
        type: Date,
        default: next_date
    }

}, {
    versionKey: false,
    timestamps: true
})

const Recurring = model('recurring_order', recurringSchema)
module.exports = Recurring;