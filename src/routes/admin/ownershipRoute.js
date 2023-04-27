const express = require("express");
const { Router } = express;
const router = Router();

const { authenticate } = require("../../middleware/auth");
const ownershipType = require("../../controllers/admin/ownershipController");


/** 
 * Add Language
*/
// router.post("/ownershiptype", ownershipType.addOwnershipType);

module.exports = router;