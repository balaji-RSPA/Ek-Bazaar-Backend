const express = require("express");
const { Router } = express;
const router = Router();
const subscriptionPlan = require("../../controllers/web/subscriptionPlanController");

/** 
 * Get all subscription plan
*/
router.get("/subscriptionplan", subscriptionPlan.getAllSubscriptionPlan);
router.post("/acticateTrialPlan", subscriptionPlan.acticateTrialPlan);
router.get('/abouttoexpire', subscriptionPlan.getAboutToexpire);
router.get('/expiredplan', subscriptionPlan.getExpiredPlan);

module.exports = router;