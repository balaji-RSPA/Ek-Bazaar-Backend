const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose

const countrySchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    lowercase: true
  },
  iso: {
    type: String,
    default: null,
    lowercase: true
  },
  status: {
    type: Boolean,
    default: true
  },
  serialNo: {
    type: Number,
    default: null
  },
  country_calling_code: {
    type: String,
    default: null
  },
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