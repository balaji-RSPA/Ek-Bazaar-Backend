const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const newsSchema = new Schema(
    {
        news:{
            type: String
        }
    },
    {
        timestamps:true,
        versionKey: false,
    }
)

const News = model("news", newsSchema)
module.exports = News;