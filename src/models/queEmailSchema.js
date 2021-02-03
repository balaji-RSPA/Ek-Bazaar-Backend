const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const queEmailSchema = new Schema({
    qid: {
        type: ObjectId,
        default: null
    },
    userId: {
        type: ObjectId,
        // ref: 'users',
        default: null
    },
    sellerId: {
        type: ObjectId,
        ref: 'sellers',
        default: null
    },
    name: {
        type: String,
        trim: true,
        default: null
    },
    subject: {
        type: String,
        trim: true,
        default: null
    },
    body: {
        type: String,
        trim: true
    },
    fromEmail: {
        type: String
    },
    toEmail: {
        type: String,
        default: null
    },
    isSent: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {
    versionKey: false,
    timestamps: true
})

const QueEmails = model('qemails', queEmailSchema)
module.exports = QueEmails;
