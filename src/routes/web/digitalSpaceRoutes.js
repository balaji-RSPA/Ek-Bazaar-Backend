const express = require("express");
const { Router } = express;
const router = Router();
const digitalSpace = require("../../controllers/web/digitalOcean");
const { authenticate } = require("../../middleware/auth");

router.get("/digital_space/list_all", authenticate,digitalSpace.listAllDigitalOceanImages);
router.delete("/digital_space/delete", authenticate,digitalSpace.deleteDigitalOceanDocs);

module.exports = router;