const mongoose = require('mongoose');


const { Schema, model, Types} = mongoose;

let updatedExcengeSchema = new Schema({
    base:{
        type: String,
        default: "USD",
    },
    timestamp: {
        type: Number,
    },
    date : {
        type: String,
    },
    rates : {
        type: Object
    }
},{
    timestamps:true,
    versionKey: false
})

let UpdatedExcenge = model("updatedExcenge",updatedExcengeSchema);

module.exports = UpdatedExcenge;
