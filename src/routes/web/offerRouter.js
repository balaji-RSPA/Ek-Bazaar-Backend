const express = require("express");
const { Router } = express;
const router = Router();

const offers = require('../../controllers/web/offersController')

router.get("/offers",offers.getAllOffers )
router.get("/sellerOffers", offers.getAllSellerOffers);
// router.get("/buyerRquest", offers.getAllBuyerRequest);
router.post("/buyerRquest", offers.buyerRequestOffers);
router.post("/sellerContactOffers", offers.sellerContactOffer);
router.get("/buyerAllRequest/:id", offers.getAllBuyerRequest);
router.post("/deleteBuyerRequest/:id", offers.deleteBuyerRequest);
module.exports = router;