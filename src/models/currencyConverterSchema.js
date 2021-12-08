const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const currencyConvter = new Schema(
{
    currencyName: {
        type: String,
        required: true
    },
    unitAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false,
}
);

const CurrencyConvters = model('currencyConvter', currencyConvter)
module.exports = CurrencyConvters