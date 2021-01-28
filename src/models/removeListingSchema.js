const mongoose = require('mongoose')
const {
  Schema,
  model,
  Types
} = mongoose

const removeListingSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  url: {
    type: String,
    trim: true,
    default: null
  },
  company:{
   type: String,
   trim: true,
   default:null
  },
  mobile: {
    mobile:{
      type: String,
      trim: true,
      required: true,
    },
    countryCode:{
      type: String,
      trim: true,
      default:null
    }
  },
  reason: {
    type: String,
    trim: true,
    required: true,
  }
}, {
  timestamps: true,
  versionKey: false
})

const RemoveListing = model('removelisting', removeListingSchema)
module.exports = RemoveListing