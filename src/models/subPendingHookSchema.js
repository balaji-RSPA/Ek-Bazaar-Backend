const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const subPending = new Schema(
    {
        subPendingHookResponse: {
            type: Object,
            default: null
        }
    }, {
    timestamps: true,
    versionKey: false,
}
);

const SubPendingRes = model('subPendingHookRes', subPending)
module.exports = SubPendingRes