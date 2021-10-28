const express = require("express");
const { Router } = express;
const router = Router();
const commodity = require("../../controllers/web/commodityController");

/**
 * add all commodity
 */
router.get("/commodity", commodity.getAllCommodity);

module.exports = router;
