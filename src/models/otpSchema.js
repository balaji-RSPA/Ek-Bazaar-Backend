const mongoose = require('mongoose');

const {Schema, model, Types} = mongoose;

const OtpSchema = new Schema(
    {
        otp: {
            type: Number
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const currentOTPs = model('currenctOPT',OtpSchema);

module.exports = currentOTPs