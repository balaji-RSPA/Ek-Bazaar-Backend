const express = require("express");
const { Router } = express;
const router = Router();
const news = require("../../controllers/admin/newsController");

router.post("/news", news.createNews);

router.get("/news", news.getAllNews);

router.get("/news/:id", news.getNews);

router.put("/news/:id", news.updateNews);
router.delete("/news/:id", news.deleteNews);

module.exports = router;
