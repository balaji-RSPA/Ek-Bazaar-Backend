const express = require("express");
const { Router } = express;
const router = Router();
const language = require("../../controllers/admin/languageController");



router.get("/language", language.getLanguage);
module.exports = router;