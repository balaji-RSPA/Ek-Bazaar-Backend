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
            userId: String,
            token: String
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Chat = model("chat", chatSchema);
module.exports = Chat;
