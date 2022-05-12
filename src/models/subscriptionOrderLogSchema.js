const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require('./sellersSchema');
const SubscriptionPlan = require('./subscriptionPlanSchema')

const subscriptionOrderLog = new Schema({
    sellerId:{
        type:ObjectId,
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
    orderDetails:{
        type:Object,
        default:{}
    },
    paymentResponse:{
        type:Object,
        required:true
    },
    currency:{
        type:String,
        default:null
    },
    isSubscription:{
        type:Boolean,
        default:false
    },
    rzrPaymentId:{
        type: String,
        required:true
    },
    rzrSubscriptionId:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    }
    
}, {
    versionKey: false,
    timestamps: true
})

const subOrderslogs = model('sub_orders_log', subscriptionOrderLog)
module.exports = subOrderslogs;