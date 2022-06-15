const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const priceUnitSchema = new Schema(
    {
        value:{
            type: String,
            trim: true,
        },
        label:{
            type: String,
            trim:true,
        },
        tag:{
            type: Number,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PriceUnit = model("priceUnit", priceUnitSchema);
module.exports = PriceUnit;