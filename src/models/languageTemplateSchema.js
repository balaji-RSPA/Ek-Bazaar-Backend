const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const languageTemplateSchema = new Schema(
    {
        l1: {
            type: Object,
        },
        l2: {
            type: ObjectId
        },
        l3: {
            type: ObjectId
        },
        name: {
            type: String
        },

        languages: {
            type: Object
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const LanguageTemplate = model("languagetemplates", languageTemplateSchema);
module.exports = LanguageTemplate;
