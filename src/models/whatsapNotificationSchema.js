const mongoose = require('mongoose')

const {Schema, Types, model} = mongoose;

const {ObjectId} = Types;


//Schema will get used for setLanguage Notification and complete Profile Reminder Notification
const genralTypeANotificationSchema = new Schema({
    started: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    count : {
        type: Number,
        default: 0
    },
    lastTriggerd: {
        type: Date,
        default: null
    }
})

const onCompleateProfileSchema = new Schema({
    triggred: {
        type: Boolean,
        default: false
    },
    triggredTime : {
        type: Date,
        default: null
    }
})

const genralTypeBNotificationSchema = new Schema({
    started: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    },
    hasProduct: {
        type: Boolean,
        default: false
    },
    lastTriggred: {
        type: Date
    }
})

let whatsappNotificationSchema = new Schema({
    sellerId: {
        type: ObjectId,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    reciver_number: {
        type: Number,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: 'Coustomer'
    },
    completed: {
        type: Boolean,
        default: false
    },
    setLanguageNotification: {
        type: genralTypeANotificationSchema,
        required: true
    },
    completeProfilReminder: {
        type: genralTypeANotificationSchema,
        required: true
    },
    onCompleteProfile: {
        type: onCompleateProfileSchema,
        required: true
    },
    addProduct: {
        type: genralTypeBNotificationSchema,
        required: true
    },
    addProductReminder: {
        type: genralTypeBNotificationSchema,
        required: true
    }


},{
    timestamps: true,
    versionKey: false
})

let WhatsAppNotification = model('whatsappNotifiction', whatsappNotificationSchema);

module.exports = WhatsAppNotification