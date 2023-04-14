const express = require("express");

const { Router } = express;

const router = Router();

const getAllReferalcodesfunc =require('../../controllers/web/referralcodeController')

router.get("/referralcode", getAllReferalcodesfunc.getAllReferalcodesfunc);

module.exports = router;