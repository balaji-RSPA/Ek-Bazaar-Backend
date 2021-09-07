const express = require("express");
const { Router } = express;
const router = Router();
const news = require("../../controllers/admin/newsController");

/**
 * add news
 */
router.post("/news", news.createNews);

/**
 * get all news
 */
router.get("/news", news.getAllNews);

/**
 * get specific news
 */
router.get("/news/:id", news.getNews);

/**
 * update news
 */
router.put("/news/:id", news.updateNews);

/**
 * delete news
 */
router.delete("/news/:id", news.deleteNews);

module.exports = router;
