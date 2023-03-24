const mongoose = require('mongoose');
const schema = mongoose.Schema

const dateSchema = new schema({
    date: { type: Date, default: Date.now },
}, { timestamps: true })
const dateModule = mongoose.model("gsupdatedtime", dateSchema)
module.exports=dateModule