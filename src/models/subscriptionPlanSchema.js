const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const { ObjectId } = Types

const subscriptionPlanSchema = new Schema({
    type: {
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
    unit : {
      type: String,
      required: true
    },
    popularity:{
      type: String,
      required: true
    },
    billing_type:{
      type: String,
      required: true
    }
}, {
    timestamps: true,
    versionKey: false
})
const SubscriptionPlan = model('subscriptionPlan', subscriptionPlanSchema)
module.exports = SubscriptionPlan