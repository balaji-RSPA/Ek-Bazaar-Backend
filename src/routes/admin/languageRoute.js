const express = require("express");
const { Router } = express;
const router = Router();

const { authenticate } = require("../../middleware/auth");
const language = require("../../controllers/admin/languageController");


/** 
 * Add Language
*/
// router.post("/language", language.addLanguage);

module.exports = router;