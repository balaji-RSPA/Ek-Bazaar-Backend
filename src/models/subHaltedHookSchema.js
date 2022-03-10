const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const subHalted = new Schema(
    {
        subHaltedHookResponse: {
            type: Object,
            default: null
        }
    }, {
    timestamps: true,
    versionKey: false,
}
);

const SubHaltedRes = model('subHaltedHookRes', subHalted)
module.exports = SubHaltedRes