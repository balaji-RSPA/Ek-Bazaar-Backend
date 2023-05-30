const mongoose = require('mongoose');

const {model,Schema,Types} = mongoose;

const { ObjectId} = Types


const mPesaOrderSchema = new Schema({
    sellerId: {
        type: ObjectId,
        required: true
    },
    subscriptionId: {
        type: ObjectId,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    orderDetails: {
        type: Object,
        required: true
    },
    currency: {
        type: String,
        default: true
    },
    mPesaResponce: {
        type: Object,
    }
},{
    timestamps:true,
    versionKey:false
});

const Mpesa = model('mPesaOrder', mPesaOrderSchema);

module.exports = Mpesa;