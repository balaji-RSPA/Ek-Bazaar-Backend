const express = require("express");
const { Router } = express;
const router = Router();
const subscriptionPlan = require("../../controllers/web/subscriptionPlanController");

/** 
 * Get all subscription plan
*/
router.get("/subscriptionplan",subscriptionPlan.getAllSubscriptionPlan);

module.exports = router;