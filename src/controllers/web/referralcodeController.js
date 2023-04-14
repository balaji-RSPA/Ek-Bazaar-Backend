const { respSuccess, respError } = require("../../utils/respHadler");
const { Referalcodes } = require("../../modules");
const {getAllReferralcode } = Referalcodes;

// { client: 'ekb' }

module.exports.getAllReferalcodesfunc = async (req, res) => {
    try {
        const { skip, limit } = req.body
        let myQuery = {};
        const checksite = req.query;

        if (checksite && checksite.client && checksite.client === 'ekb'){
            myQuery = {
                client: {$in : ['both','ekbazaar'] }
            }
        }
        if (checksite && checksite.client && checksite.client === 'one') {
            myQuery = {
                client: { $in: ['both', 'onebazaar'] }
            }
        }

        const referalcode = await getAllReferralcode(myQuery || {}, skip, limit);
        respSuccess(res, referalcode);
        // res.send("ok")
    } catch (error) {
        respError(res, error.message);
    }
};