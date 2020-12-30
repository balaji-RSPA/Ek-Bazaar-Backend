
const express = require("express");
const { Router } = express;
const router = Router();
const buyer = require("../../controllers/admin/buyerController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Get buyer
*/
router.get("/buyer/:id",authenticate,buyer.getBuyer);
/** 
 * Update buyer
*/
router.put("/buyer",authenticate,buyer.updateBuyer);
/** 
 * Get all buyer
*/
router.get("/buyers", buyer.getAllBuyers);

module.exports = router;