const { TransportReq } = require('../../modules');
const { createTransportRequest }=TransportReq
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');


module.exports.TransportReqCreate = async (req, res) => {
    try {
        let data = req.body
        let createdTransportDetails = await createTransportRequest(data)

        respSuccess(res, createdTransportDetails, "transportReq is created");

    } catch (error) {
        respError(res, error.message)
    }
}