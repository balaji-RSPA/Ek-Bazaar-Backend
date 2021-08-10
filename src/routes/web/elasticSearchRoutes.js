const express = require("express");
const { Router } = express;
const router = Router();
const elastic = require("../../controllers/web/elasticSearchController");
const atlas = require("../../controllers/web/atlasSearch")

router.post("/elastic/seller/bulkwrite", elastic.addSellerBulkIndex);
// router.get("/elastic/seller/searchSeller", elastic.serachSeller);
router.get("/elastic/seller/searchSeller", atlas.searchSeller);
router.get("/elastic/search", elastic.searchSuggestion);

module.exports = router;