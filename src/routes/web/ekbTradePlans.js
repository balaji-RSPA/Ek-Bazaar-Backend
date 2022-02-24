const express = require("express");
const { Router } = express;
const router = Router();
const ekbPlans = require("../../controllers/web/ekbPlansController");



router.post("/createPlans", ekbPlans.createPlans);


module.exports = router;