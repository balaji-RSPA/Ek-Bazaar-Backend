const express = require("express");
const { Router } = express;
const router = Router();
const commodity = require("../../controllers/admin/commodityController");

router.post("/commodity", commodity.createCommodity);
router.get("/commodity", commodity.getAllCommodity);

router.get("/commodity/:id", commodity.getCommodity);

router.put("/commodity/:id", commodity.updateCommodity);
router.delete("/commodity/:id", commodity.deleteCommodity);


module.exports = router;