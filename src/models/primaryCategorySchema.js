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
      ref: 'new_secondarycategories',
      default: []
    }],
    parentCatId: {
      type: ObjectId,
      ref: 'new_parentcategories',
      default: null
    },
    image: {
      type: { image }
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PrimaryCategory = model("new_primarycategories", primaryCatSchema);
module.exports = PrimaryCategory;