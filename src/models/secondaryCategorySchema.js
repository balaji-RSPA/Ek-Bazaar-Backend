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
    productId:[{
        type: ObjectId,
        ref: "products",
        default: null
    }],
    image: {
      type: { image }
    },
    primaryCatId: {
        type: ObjectId,
        ref: PrimaryCategory,
        default: null
    }
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SecondaryCategory = model("secondaryCategory", secondaryCatSchema);
module.exports = SecondaryCategory;