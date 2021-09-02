const express = require("express");
const { Router } = express;
const router = Router();
const news = require("../../controllers/admin/newsController");

router.post("/news", news.createNews);

router.get("/news", news.getAllNews);

module.exports = router;
