const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const languageTemplateOneSchema = new Schema(
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

const LanguageTemplateOne = model("languagetemplatesone", languageTemplateOneSchema);
module.exports = LanguageTemplateOne;
