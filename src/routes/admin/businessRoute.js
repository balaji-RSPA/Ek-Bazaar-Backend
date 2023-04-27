const express = require("express");
const { Router } = express;
const router = Router();

const { authenticate } = require("../../middleware/auth");
const businessType = require("../../controllers/admin/businessController");


/** 
 * Add Language
*/
// router.post("/primarybusinesstype", businessType.addPrimaryBT);

module.exports = router;