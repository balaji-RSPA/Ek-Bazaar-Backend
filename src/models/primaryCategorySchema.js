const mongoose = require("mongoose");
// const ParentCategory = require('./parentCategorySchema')
// const SecondaryCategory = require('./secondaryCategorySchema')
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const image = new Schema({
  name: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
  },
});

const primaryCatSchema = new Schema(
  {
    vendorId: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: Boolean,
      default: true
    },
    secondaryCategotyId: [{
      type: ObjectId,
      ref: 'level3',
      default: []
    }],
    parentCatId: {
      type: ObjectId,
      ref: 'level1',
      default: null
    },
    image: {
      type: { image }
    },
    l1: {
      type: String
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PrimaryCategory = model("level2", primaryCatSchema);
module.exports = PrimaryCategory;