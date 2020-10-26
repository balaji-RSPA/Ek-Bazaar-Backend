const express = require("express");
const { Router } = express;
const router = Router();
const buyer = require("../../controllers/web/buyerController");

router.post("/buyer", buyer.addBuyer);
router.get("/buyer/:id", buyer.getBuyer);
router.put("/buyer", buyer.updateBuyer);
router.get("/buyers", buyer.getAllBuyers);

module.exports = router;
