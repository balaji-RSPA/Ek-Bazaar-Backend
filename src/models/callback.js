const mongoose = require('mongoose');
const schema = mongoose.Schema

const mobile = new schema({
    mobile: {
        type: String,
        trim: true
    },
})

const mySchema = new schema({
    name: { 
        type: String 
    },
    mobile:  [mobile],
    source:{type:String, default:"market"},
},{ timestamps: true,versionKey:false });


const myModel = mongoose.model("callBack", mySchema)
module.exports = myModel 

///