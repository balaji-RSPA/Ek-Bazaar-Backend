const { respSuccess, respError } = require("../../utils/respHadler");
const { subscriptionPlan } = require("../../modules");
const {
 getAllSubscriptionPlan
 } = subscriptionPlan;

/**
 * Get all subscription plan
*/
module.exports.getAllSubscriptionPlan = async (req, res) => {
  try {
    const { skip,limit } = req.body
    const subscriptionPlan = await getAllSubscriptionPlan(skip,limit);
    respSuccess(res, subscriptionPlan);
  } catch (error) {
    respError(res, error.message);
  }
};