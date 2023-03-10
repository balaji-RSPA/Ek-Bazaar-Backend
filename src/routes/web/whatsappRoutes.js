const express = require('express');

const { Router } = express;

const router = Router();


const whatsapp = require('../../controllers/web/whatsappTemplateController');


router.post('/createWhatsappTemplates', whatsapp.whatsappTempCreate);
// router.post('/sendWelcomeWhatsapp', whatsapp.sendWelcome)

module.exports = router;