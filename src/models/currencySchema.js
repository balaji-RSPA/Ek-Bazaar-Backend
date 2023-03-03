const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const currencyExcenge = new Schema(
    {
        currencyName: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        },
        base:{
            type:String,
            default:'USD'
        },
        exchangeRate: {
            type: Number,
            default: 1,
            required:true
        },
        currency_symbol:{
            type: String
        }
    }, {
    timestamps: true,
    versionKey: false,
}
);

const currencyExcenges = model('currencyExcenge', currencyExcenge)
module.exports = currencyExcenges