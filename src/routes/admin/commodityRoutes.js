const express = require("express");
const { Router } = express;
const router = Router();
const commodity = require("../../controllers/admin/commodityController");

/**
 * add news
 */
router.post("/commodity", commodity.createCommodity);

/**
 * add all commodity
 */
router.get("/commodity", commodity.getAllCommodity);

/**
 * add specific commodity
 */
router.get("/commodity/:id", commodity.getCommodity);

/**
 * update commodity
 */
router.put("/commodity/:id", commodity.updateCommodity);

/**
 * delete commodity
 */
router.post("/deleteCommodity", commodity.deleteCommodity);


/**
 * Reset commodity
 */
router.post("/resetCommodity", commodity.resetCommodity);


module.exports = router;
