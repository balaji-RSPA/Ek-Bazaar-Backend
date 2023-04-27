const mongoose = require('mongoose');
const schema = mongoose.Schema

const mySchema = new schema({
    primaryBusinessType: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
}
)

const PrimaryBusenessTypeModel = mongoose.model("primarybusinesstype", mySchema)
module.exports = PrimaryBusenessTypeModel 