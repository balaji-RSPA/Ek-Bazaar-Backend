const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const Country = require('./countriesSchema')
const { ObjectId } = Types

const statesSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    country: {
        type: ObjectId,
        ref: Country,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

statesSchema.index({
  name: 1,
  country: 1
}, {
  background: false,
  unique: true,
  partialFilterExpression: {
    name: {
      $exists: true
    },
    country: {
      $exists: true
    }
  }
})

const States = model('states', statesSchema)
module.exports = States