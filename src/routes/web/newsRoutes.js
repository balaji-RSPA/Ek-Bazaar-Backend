const express = require("express");
const { Router } = express;
const router = Router();
const news = require("../../controllers/web/newsController");

/**
 * get all news
 */
router.get("/news", news.getAllNews);

module.exports = router;
