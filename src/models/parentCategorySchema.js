const mongoose = require("mongoose");
const PrimaryCategory = require('./primaryCategorySchema')
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

const parentCatSchema = new Schema(
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
    primaryCategotyId:[{
        type: ObjectId,
        ref: PrimaryCategory,
        default: null
    }],
    image: {
        type: { image }
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ParentCategory = model("parentcategories", parentCatSchema);
module.exports = ParentCategory;