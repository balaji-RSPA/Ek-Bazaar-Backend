const { respSuccess, respError } = require("../../utils/respHadler");
const { BusinessType } = require("../../modules");
const { addPrimaryBT,
    getPrimaryBT
} = BusinessType

module.exports.addPrimaryBT = async (req, res) => {
    try {
        const businessType = await addPrimaryBT(req.body);
        respSuccess(res, businessType, "Record successfully added");
    } catch (error) {
        respError(res, error.message);
    }
};

module.exports.getPrimaryBT = async (req, res) => {
    try {
        const businessType = await getPrimaryBT(req.body);
        respSuccess(res, businessType, "PrimaryBusinessType data get successfull");
    } catch (error) {
        respError(res, error.message);
    }
};