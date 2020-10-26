const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const Country = require('./countriesSchema')
const { ObjectId } = Types

const statesSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    countryId: {
        type: ObjectId,
        ref: Country,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

const States = model('states', statesSchema)
module.exports = States