const express = require("express");
const { Router } = express;
const router = Router();
const buyer = require("../../controllers/web/buyerController");
const auth = require("../../controllers/web/authController");
const { authenticate } = require("../../middleware/auth");

router.get("/buyer/rfp/:sellerId", authenticate, buyer.getRFPS);
router.post('/buyer/rfp', buyer.createRFP)
// router.post("/buyer", buyer.addBuyer);
router.get("/buyer", authenticate, buyer.getBuyer);
router.put("/buyer", authenticate, buyer.updateBuyer);
router.get("/buyers", buyer.getAllBuyers);
// router.post("/buyer/update-buyer-password", buyer.updateBuyerPassword);

module.exports = router;