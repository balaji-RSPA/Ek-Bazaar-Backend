const mongoose = require('mongoose')
const schema = mongoose.Schema

const addressSchema = new schema({
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        require: true
    },
    line1: {
        type: String
    },
    line2: {
        type: String
    },
    locality: {
        type: String
    },
    landmark: {
        type: String
    }
})

const TransportReqSchema = new schema(
    {
        unit:{
            type:String,
            default:"Vehicles",
        },
        cargoCategoryName: {
            type:String
        },
        vehicleCategoryName:{
            type:String
        },
        pickUpAddress: {
            type: addressSchema,
        },
        pickUpContact: {
            type: Object,

        },
        dropAddress:{
            type: addressSchema,
        },
        dropContact: {
            type: Object,
        },
        pickUpDatetime:{
            type: Date,
        },
        quantity: {
            type: Number,
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
)

const TransportReq = mongoose.model('cargoexchangeorder', TransportReqSchema);

module.exports = TransportReq