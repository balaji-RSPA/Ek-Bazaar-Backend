const express = require("express");
const { Router } = express;
const router = Router();

const { authenticate } = require("../../middleware/auth");
const businessType = require("../../controllers/admin/businessController");


/** 
 * Add Language
*/
router.get("/primarybusinesstype", businessType.getPrimaryBT);

module.exports = router;