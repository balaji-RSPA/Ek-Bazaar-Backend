const express = require("express");
const { Router } = express;
const router = Router();
const seller = require("../../controllers/web/sellersController");
const auth = require("../../controllers/web/authController");
const { sellerAuthenticate } = require("../../middleware/auth");

router.post("/seller/bulkInsert", seller.sellerBulkInsert);

router.post("/seller", seller.addSeller);
router.get("/seller", /* sellerAuthenticate, */ seller.getSeller);
router.put("/seller", sellerAuthenticate, seller.updateSeller);
router.get("/sellers", seller.getAllSellers);
router.post("/seller/update-seller-password", seller.updateSellerPassword);

router.post('/seller/check-seller-exist-or-not', seller.checkSellerExistOrNot)
router.post('/seller/send-otp', seller.sendOtp)

router.post("/seller/login", auth.sellerLogin);

module.exports = router;
