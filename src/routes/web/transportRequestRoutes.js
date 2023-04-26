const express = require('express');

const { Router } = express;

const router = Router();


const transportreq = require('../../controllers/web/transportReqController');


router.post('/transportrequest', transportreq.TransportReqCreate);

module.exports = router;