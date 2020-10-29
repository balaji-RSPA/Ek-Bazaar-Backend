const mongoose = require("mongoose");
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
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Products = model("products", productsSchema);
module.exports = Products;
