const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose
const { ObjectId } = Types


const whatappTemplateSchema = new Schema(
    {
        template_id: {
            type: String,
            required: true
        },
        client_number: {
            type: String,
            required: true
        },
        task_name: {
            type: String,
        },
        message: {
            type: String
        },
        purpose: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

let WhatsappTemplate = model('whatsapptemplate', whatappTemplateSchema);

module.exports = WhatsappTemplate