const mongoose = require('mongoose');

const {
    Schema,
    model
} = mongoose;

const contactSchema = new Schema({
    type: {
        type: Number, //1---> tender,2-->trade,3-->investment
        trim: true,
        required: true
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        default: null
    },
    company: {
        type: String,
        trim: true,
        default: null
    },
    workEmail: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    isAgree: {
        type: Boolean,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: null
    }
}, {
    versionKey: false,
    timestamps: false
});

const Contact = model('contactus', contactSchema)
module.exports = Contact;