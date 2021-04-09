const express = require("express");
const { Router } = express;
const router = Router();

const offers = require('../../controllers/web/offersController')

router.get("/offers",offers.getAllOffers )
router.get("/sellerOffers", offers.getAllSellerOffers);
router.get("/buyerRquest", offers.getAllBuyerRequest);
module.exports = router;