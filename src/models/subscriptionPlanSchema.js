const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const { ObjectId } = Types

const subscriptionPlanSchema = new Schema({
  groupType: {
    type: Number,
    required: true
  },
  type: {//Quarterly,Yearly,Full Bazaar
    type: String,
    trim: true,
    required: true
  },
  planType: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  usdPrice: {
    type: Number,
    required: true
  },
  priceUnit: {//month,year
    type: String,
    required: true
  },
  popularity: {//Most Popular, popular, less popular
    type: String,
    required: true
  },
  billingType: {//billed quarterly,billed yearly,billed monthly
    type: String,
    required: true
  },
  days: {
    type: String,
    required: true
  },
  features: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  numberOfExtends: {
    type: Number
  },
  plan_id:{
    type: String
  },
  gstamount:{
    type:Number
  },
  totalamount:{
    type: Number
  }
}, {
  timestamps: true,
  versionKey: false
})
const SubscriptionPlan = model('subscriptionPlan', subscriptionPlanSchema)
module.exports = SubscriptionPlan