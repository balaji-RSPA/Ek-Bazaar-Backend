const { respSuccess, respError } = require("../../utils/respHadler");
const { LanguageTemplate } = require("../../modules");
const { createLanguageTemplate } = LanguageTemplate

module.exports.uploadChatLanguageData = async (req, res) => {
    try {
        console.log(req.body, ' gggggggggggggggggggg')

    } catch (err) {
        console.log(error)
    }
}