const express = require("express");
const { Router } = express;
const router = Router();

const referralcode = require("../../controllers/admin/referralcodeController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Add subscription plan 
*/
router.post("/referralcode", authenticate, referralcode.addReferralcode);
/** 
 * Update subscription plan
*/
router.put("/referralcode", referralcode.updateReferralcode);
/** 
 * Delete subscription plan
*/
router.delete("/referralcode/:id", authenticate, referralcode.deleteReferralcode);
/** 
 * Get subscription plan
*/
router.get("/referralcode/:id", authenticate, referralcode.getReferralcodeDetail);
/** 
 * Get all subscription plan
*/
router.get("/referralcode", authenticate, referralcode.getAllReferralcode);

module.exports = router;