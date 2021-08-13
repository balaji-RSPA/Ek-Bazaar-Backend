const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const invoiceSchema = new Schema(
    {
        invoiceNumber: {
            type: Number
        },
        id: {
            type: Number
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const InvoiceNumber = model('invoiceNumbers', invoiceSchema)
module.exports = InvoiceNumber