const express = require("express");
const { Router } = express;
const router = Router();
const subscriptionPlan = require("../../controllers/admin/subscriptionPlanController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Add subscription plan 
*/
router.post("/subscriptionplan",authenticate,subscriptionPlan.addSubscriptionPlan);
/** 
 * Update subscription plan
*/
router.put("/subscriptionplan",authenticate,subscriptionPlan.updateSubscriptionPlan);
/** 
 * Delete subscription plan
*/
router.delete("/subscriptionplan/:id",authenticate,subscriptionPlan.deleteSubscriptionPlan);
/** 
 * Get subscription plan
*/
router.get("/subscriptionplan/:id",authenticate,subscriptionPlan.getSubscriptionPlanDetail);
/** 
 * Get all subscription plan
*/
router.get("/subscriptionplan",authenticate,subscriptionPlan.getAllSubscriptionPlan);

module.exports = router;