const mongoose = require('mongoose');
const schema = mongoose.Schema
const mySchema = new schema({
    name: { type: String },
    mobileNumber: { type: Number },
    date: { type: Date, default: Date.now },
});
const myModel = mongoose.model("callBack", mySchema)
module.exports = myModel

///