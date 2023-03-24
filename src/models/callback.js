const mongoose = require('mongoose');
const schema = mongoose.Schema

const mobile = new schema({
    mobile: {
        type: String,
        trim: true
    },
})

const mySchema = new schema({
    name: { type: String },
    mobile:  [mobile], default: [] ,
    date: { type: Date, default: Date.now },
    source:{type:String, default:"market"},
},{ timestamps: true, });


const myModel = mongoose.model("callBack", mySchema)
module.exports = myModel 

///