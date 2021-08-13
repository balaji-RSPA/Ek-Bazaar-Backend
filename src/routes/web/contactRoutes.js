const express = require("express");
const {
  Router
} = express;
const router = Router();
const contact = require("../../controllers/web/contactController");

router.post("/contact", contact.addContact)

module.exports = router;