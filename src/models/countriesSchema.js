const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose

const countrySchema = new Schema({
    name: {
        type: String,
        trim: true,
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

countrySchema.index({
  name: 1
}, {
  background: false,
  unique: true,
  partialFilterExpression: {
    name: {
      $exists: true
    }
  }
})

const Countries = model('countries', countrySchema)
module.exports = Countries