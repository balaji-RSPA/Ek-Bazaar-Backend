const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const State = require("./statesSchema");
const Countries = require("./countriesSchema")

const citiesSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: ObjectId,
      ref: Countries,
      // required: true,
    },
    state: {
      type: ObjectId,
      ref: State,
      // required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

citiesSchema.index({
  name: 1,
  state: 1
}, {
  background: false,
  unique: true,
  partialFilterExpression: {
    name: {
      $exists: true
    },
    state: {
      $exists: true
    }
  }
})

const cities = model('cities', citiesSchema)
module.exports = cities
