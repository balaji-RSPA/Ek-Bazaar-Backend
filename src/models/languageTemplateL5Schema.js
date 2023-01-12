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
        l4: {
            type: ObjectId
        },
        l5: {
            type: ObjectId
        },
        name: {
            type: String
        },
        questions: {
            type: Object
        },
        categoryNames: {
            type: Object
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const LanguageTemplateL5 = model("language_L5_templates", languageTemplateSchema);
module.exports = LanguageTemplateL5;
