const express = require("express");
const { Router } = express;
const router = Router();

const { authenticate } = require("../../middleware/auth");
const ownershipType = require("../../controllers/admin/ownershipController");


/** 
 * Add Language
*/
router.get("/ownershiptype", ownershipType.getOwnershipType);

module.exports = router;