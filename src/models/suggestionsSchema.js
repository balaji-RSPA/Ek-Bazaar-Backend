const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const suggestionsSchema = new Schema(
    {
        id:{
            type: ObjectId,
            require: true
        },
        name: {
            type: String,
            trim: true,
            required: true,
            lowercase: true
        },
        search: {
            type: String,
            trim: true,
            required: true
        },
        vendorId: {
            type: String,
            trim: true,
            required: true,
        },
        l1: {
            type: String,
            trim: true,
            required: true,
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)
const Suggestions = model('suggestions', suggestionsSchema)
module.exports = Suggestions