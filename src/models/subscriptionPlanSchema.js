const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const { ObjectId } = Types

const subscriptionPlanSchema = new Schema({
    type: {//Quarterly,Yearly,Full Bazaar
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
    priceUnit : {//month,year
      type: String,
      required: true
    },
    popularity:{//Most Popular, popular, less popular
      type: String,
      required: true
    },
    billingType:{//billed quarterly,billed yearly,billed monthly
      type: String,
      required: true
    },
    days:{
      type: String,
      required: true
    }
}, {
    timestamps: true,
    versionKey: false
})
const SubscriptionPlan = model('subscriptionPlan', subscriptionPlanSchema)
module.exports = SubscriptionPlan