const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const chatSchema = new Schema(
    {
        details: {
            type: Object,
        },
        sellerId: {
            type: ObjectId,
            ref: 'sellers'
        },
        buyerId: {
            type: ObjectId,
            ref: 'buyers'
        },
        userId: {
            type: ObjectId
        },
        session: {
            userId: {
                type: String
            },
            authToken: {
                type: String
            },
            username: {
                type: String
            }
        },
        isLanguageSet: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Chat = model("chat", chatSchema);
module.exports = Chat;
