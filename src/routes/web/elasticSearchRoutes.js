const express = require("express");
const { Router } = express;
const router = Router();
const elastic = require("../../controllers/web/elasticSearchController");

router.post("/elastic/seller/bulkwrite", elastic.addSellerBulkIndex);

module.exports = router;