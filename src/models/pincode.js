const mongoose = require('mongoose');
const { Schema, model,Types } = mongoose;
const { ObjectId } = Types;

const pincodeSchema = new Schema({
 pincode: {
   type: String,
   required: true
 },
 district:{
  type: String,
  required: true
 },
 stateName:{
   type: String,
   required: true
 }

}, {
  versionKey: false,
  timestamps: true
})

const Pincodes = model('pincode', pincodeSchema)
module.exports = Pincodes;
