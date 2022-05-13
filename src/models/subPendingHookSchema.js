const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const subPending = new Schema(
    {
        subPendingHookResponse: {
            type: Object,
            default: null
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
}
);

const SubPendingRes = model('subPendingHookRes', subPending)
module.exports = SubPendingRes