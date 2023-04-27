const mongoose = require('mongoose');
const schema = mongoose.Schema

const mySchema = new schema({
    ownershipType: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
}
)

const OwnershipTypeModel = mongoose.model("ownershipType", mySchema)
module.exports = OwnershipTypeModel 