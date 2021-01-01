const { respSuccess, respError } = require("../../utils/respHadler");
const { subscriptionPlan } = require("../../modules");
const {
 addSubscriptionPlan,
 updateSubscriptionPlan,
 deleteSubscriptionPlan,
 getSubscriptionPlanDetail,
 getAllSubscriptionPlan
 } = subscriptionPlan;
/**
 * Add subscription plan
*/
module.exports.addSubscriptionPlan = async (req, res) => {
  try {
    const subscriptionPlan = await addSubscriptionPlan(req.body);
    respSuccess(res, subscriptionPlan,"Record successfully added");
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Edit subscription plan
*/
module.exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const {_id} = req.body
    const subscriptionPlan = await updateSubscriptionPlan({_id : _id },req.body);
    respSuccess(res, subscriptionPlan,"Record successfully updated");
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Delete subscription plan
*/
module.exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params
    const subscriptionPlan = await deleteSubscriptionPlan({_id : id });
    respSuccess(res, subscriptionPlan,"Record successfully deleted");
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get subscription plan detail
*/
module.exports.getSubscriptionPlanDetail = async (req, res) => {
  try {
    const { id } = req.params
    const subscriptionPlan = await getSubscriptionPlanDetail({_id : id });
    respSuccess(res, subscriptionPlan);
  } catch (error) {
    respError(res, error.message);
  }
};
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