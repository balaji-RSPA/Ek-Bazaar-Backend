const express = require("express");
const { Router } = express;
const router = Router();
const buyer = require("../../controllers/web/buyerController");
const auth = require("../../controllers/web/authController");
const { buyerAuthenticate } = require("../../middleware/auth");

router.post("/buyer", buyer.addBuyer);
router.get("/buyer", buyerAuthenticate, buyer.getBuyer);
router.put("/buyer", buyerAuthenticate, buyer.updateBuyer);
router.get("/buyers", buyer.getAllBuyers);
router.post("/buyer/update-buyer-password", buyer.updateBuyerPassword);

router.post("/buyer/login", auth.buyerLogin);

module.exports = router;
