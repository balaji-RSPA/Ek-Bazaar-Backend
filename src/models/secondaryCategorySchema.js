const mongoose = require("mongoose");
const PrimaryCategory = require('./primaryCategorySchema')
// const Products = require('./productsSchema')
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

const secondaryCatSchema = new Schema(
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
    productId: [{
      type: ObjectId,
      ref: "new_products",
      default: []
    }],
    image: {
      type: { image }
    },
    primaryCatId: {
      type: ObjectId,
      ref: PrimaryCategory,
      default: null
    },
    l1: {
      type: String,
      default: true
    }

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

secondaryCatSchema.index({
  name: 1,
  vendorId: 1
}, {
  background: false,
  // unique: true,
  partialFilterExpression: {
    name: {
      $exists: true
    },
    vendorId: {
      $exists: true
    }
  }
})

const SecondaryCategory = model("new_secondarycategories", secondaryCatSchema);
module.exports = SecondaryCategory;