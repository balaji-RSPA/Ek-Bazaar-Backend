const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;
const Seller = require("./sellersSchema");
const Buyer = require('./buyersSchema')

const sellerOfferContactSchema = new Schema({
    sellerDetails: {
        type: Object
    },
    buyerDetails: {
        type: Object
    },
    productDetails: {
        type: Object
    },
    rfqId:{
        type: ObjectId
    },
    sellerId:{
        type: ObjectId,
        ref: Seller
    },
    buyerId: {
        type: ObjectId,
        ref: Buyer
    },
    userId:{
        type: ObjectId
    }

},
    {
        versionKey: false,
        timestamps: true,
    }
)

const SellerOffferContacts = model("selleroffercontacts", sellerOfferContactSchema);
module.exports = SellerOffferContacts;