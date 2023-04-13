const mongoose = require('mongoose');
const schema = mongoose.Schema

const referalcode = new schema({
   value:{
      type:String
   },
   label:{
      type:String
   },
   referralcode:{
    type:String
   },
   client:{
      type:String
   },
   special:{
      type:Boolean,
      default: false
   },
   isreferral:{
      type: Boolean,
   }

}, { timestamps: true, versionKey: false })
const referalModule = mongoose.model("referralcode", referalcode)
module.exports = referalModule