const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const subCancled = new Schema({
    subCancledHookResponse:{
        type:Object,
        default:null
    },
    uniqueEventId: {
        type: String,
        unique: true,
        required: true
    },
    oprated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false,
})

const cancleHookRes = model('subCancledHook', subCancled);
module.exports = cancleHookRes;