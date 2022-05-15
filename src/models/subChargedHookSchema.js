const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


const subCharged = new Schema(
    {
        subChargedHookResponse: {
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
            default:false
        }
    }, {
    timestamps: true,
    versionKey: false,
}
);

const SubChargedRes = model('subChargedHookRes', subCharged)
module.exports = SubChargedRes