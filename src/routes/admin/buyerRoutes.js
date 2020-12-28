
const express = require("express");
const { Router } = express;
const router = Router();
const buyer = require("../../controllers/admin/buyerController");
const { authenticate } = require("../../middleware/auth");

router.get("/buyer",authenticate,buyer.getBuyer);
router.put("/buyer",authenticate,buyer.updateBuyer);
router.get("/buyers", buyer.getAllBuyers);

module.exports = router;