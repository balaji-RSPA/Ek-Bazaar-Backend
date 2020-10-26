const mongoose = require("mongoose");
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const products = model("products", productsSchema);
module.exports = products;
