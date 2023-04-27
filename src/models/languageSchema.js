const mongoose = require('mongoose');
const schema = mongoose.Schema


const mySchema=new schema({
    lang:{
        type:String,
        required:true
    },
    langCode:{
        type:String,
        required: true
    }
}, { timestamps: true, 
    versionKey: false }
)


const languageModel = mongoose.model("languages", mySchema)
module.exports = languageModel 
