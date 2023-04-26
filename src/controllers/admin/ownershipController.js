const { respSuccess, respError } = require("../../utils/respHadler");
const { OwnershipType } = require("../../modules");
const { addOwnershipType,
    getOwnershipType
} = OwnershipType

module.exports.addOwnershipType = async (req, res) => {
    try {
        const ownership = await addOwnershipType(req.body);
        respSuccess(res, ownership, "Record successfully added");
    } catch (error) {
        respError(res, error.message);
    }
};

module.exports.getOwnershipType = async (req, res) => {
    try {
        const ownership = await getOwnershipType(req.body);
        respSuccess(res, ownership, "OwnershipType data get successfull");
    } catch (error) {
        respError(res, error.message);
    }
};