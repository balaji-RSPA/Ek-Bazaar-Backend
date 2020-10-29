const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const sellerTypeSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerTypes = model("sellerTypes", sellerTypeSchema);
module.exports = SellerTypes;