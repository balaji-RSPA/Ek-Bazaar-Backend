const mongoose = require("mongoose");
// const conn = require('../../config/tenderdb')
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const commonInvoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: Number,
    },
    id: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = commonInvoiceSchema;
