const express = require("express");
const { Router } = express;
const router = Router();
const csvToJson = require('convert-csv-to-json')
const fs = require('fs')
const path = require('path')
const seller = require("../../controllers/web/sellersController");
const { authenticate } = require("../../middleware/auth");

router.post("/seller/bulkInsert", seller.sellerBulkInsert);

router.get("/seller", /* sellerAuthenticate, */ seller.getSeller);
router.put("/seller", authenticate, seller.updateSeller);
router.get("/sellers", seller.getAllSellers);
router.get("/convert", function (req, res) {
    console.log(path.join(__dirname, "../../../"))
    const fileInputName = path.join(__dirname, "../../../", "files", "F&B.csv");
    const fileOutputName = path.join("../../../", "files", "F&B.json");
    csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);
    res.send(path.join("../../../", "files", "F&B.csv"))
})

module.exports = router;
