const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const imageSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    code: {
        type: String,
        trim: true,
    },
})

const sellerEstablishmentSchema = new Schema(
{
    sellerId: {
        type: ObjectId,
        ref: 'sellers',
        default: null
    },
    photos: [imageSchema]
},
{
    timestamps: true,
    versionKey: false,
});

const SellerEstablishment = model('sellerestablishment', sellerEstablishmentSchema)
module.exports = SellerEstablishment