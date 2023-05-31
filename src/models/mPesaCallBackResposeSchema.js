const mongoose = require('mongoose');

const {Schema, model,Types} = mongoose;


let mPesaCallBackSchema = new Schema({
    data: {
        type:Object
    }
})

let MpesaCallBack = model("mPesaCallBack",mPesaCallBackSchema);

module.exports = MpesaCallBack