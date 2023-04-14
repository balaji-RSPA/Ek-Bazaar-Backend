const { respSuccess, respError } = require("../../utils/respHadler");
const { Referalcodes } = require("../../modules");
const {
    addReferralcode,
    updateReferralcode,
    deleteReferralcode,
    getReferralcodeDetail,
    getAllReferralcode
} = Referalcodes;
/**
 * Add subscription plan
*/
module.exports.addReferralcode = async (req, res) => {
    try {
        // const client = (_base && (_base.includes('onebazaar') || _base.includes('8086'))) ? 'onebazaar' : 'ekbazaar'
        const subscriptionPlan = await addReferralcode(req.body);
        respSuccess(res, subscriptionPlan, "Record successfully added");
    } catch (error) {
        respError(res, error.message);
    }
};
/**
 * Edit subscription plan
*/
module.exports.updateReferralcode = async (req, res) => {
    try {
        const { _id } = req.body
        const subscriptionPlan = await updateReferralcode({ _id: _id }, req.body);
        respSuccess(res, subscriptionPlan, "Record successfully updated");
    } catch (error) {
        respError(res, error.message);
    }
};
/**
 * Delete subscription plan
*/
module.exports.deleteReferralcode = async (req, res) => {
    try {
        const { id } = req.params
        const subscriptionPlan = await deleteReferralcode({ _id: id });
        respSuccess(res, subscriptionPlan, "Record successfully deleted");
    } catch (error) {
        respError(res, error.message);
    }
};
/**
 * Get subscription plan detail
*/
module.exports.getReferralcodeDetail = async (req, res) => {
    try {
        const { id } = req.params
        const subscriptionPlan = await getReferralcodeDetail({ _id: id });
        respSuccess(res, subscriptionPlan);
    } catch (error) {
        respError(res, error.message);
    }
};
/**
 * Get all subscription plan
*/
module.exports.getAllReferralcode = async (req, res) => {
    try {
        const { skip, limit } = req.body
        const subscriptionPlan = await getAllReferralcode({ planType: "paid" }, skip, limit);
        respSuccess(res, subscriptionPlan);
    } catch (error) {
        respError(res, error.message);
    }
};