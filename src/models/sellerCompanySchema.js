const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const sellerCompanySchema = new Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "sellers",
      default: null,
    },
    employeesCount: {
      type: Number,
      trim: true,
    },
    anualTurnover: {
      type: Number,
      trim: true,
    },
    professionalAssociations: {
      type: String,
      trim: true,
    },
    certifications: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SellerCompany = model("sellercompany", sellerCompanySchema);
module.exports = SellerCompany;
