const { respSuccess, respError } = require("../../utils/respHadler");
const {create} = require('../../modules/priceUnitModule')


module.exports.addPriceUnits = async (req,res) => {
    try {
        const responce = await create(req.body)
        respSuccess(res, responce)
    } catch (error) {
       respError(res,error.massage)
    }
}