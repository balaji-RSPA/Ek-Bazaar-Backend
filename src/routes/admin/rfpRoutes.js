const express = require("express");
const { Router } = express;
const router = Router();
const rfp = require("../../controllers/admin/rfpController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Get RFP detail
*/
router.get("/rfp/:id",authenticate,rfp.getRFPDetail);
/** 
 * Get all RFP
*/
router.get("/rfp",authenticate,rfp.getAllRFP);

module.exports = router;