const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const subHalted = new Schema(
    {
        subHaltedHookResponse: {
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

const SubHaltedRes = model('subHaltedHookRes', subHalted)
module.exports = SubHaltedRes