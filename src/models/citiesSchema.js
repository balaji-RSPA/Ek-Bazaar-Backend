const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const State = require("./statesSchema");

const citiesSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    stateId: {
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

const cities = model('cities', citiesSchema)
module.exports = cities
