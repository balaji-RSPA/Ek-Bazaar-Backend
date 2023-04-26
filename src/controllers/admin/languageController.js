const { respSuccess, respError } = require("../../utils/respHadler");
const { Languages } = require("../../modules");
const { addLanguage,
    getLanguage 
     } = Languages

module.exports.addLanguage = async (req, res) => {
    try {
        const language = await addLanguage(req.body);
        respSuccess(res, language, "Record successfully added");
    } catch (error) {
        respError(res, error.message);
    }
};
module.exports.getLanguage = async (req, res) => {
    try {
        const language = await getLanguage(req.body);
        respSuccess(res, language, "Language data get successfull");
    } catch (error) {
        respError(res, error.message);
    }
};