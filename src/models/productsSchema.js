const mongoose = require("mongoose");
const ProductsSubCategories = require("./productsSubCategoriesSchema");
const SecondaryCategory = require('./secondaryCategorySchema')
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

const productsSchema = new Schema(
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
    image: {
      type: { image },
      trim: true,
    },
    secondaryId: {
      type: ObjectId,
      ref: SecondaryCategory,
      default: null
    },
    subCategoryId: [{
      type: ObjectId,
      ref: ProductsSubCategories,
      default: []
    }],
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

productsSchema.index({
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

const Products = model("level4", productsSchema);
module.exports = Products;
