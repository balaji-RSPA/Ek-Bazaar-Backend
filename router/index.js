const express = require("express");

const router = express.Router();
const controller = require("../controller");

router
  .route("/login")
  .get(controller.login)
  .post(controller.doLogin);

router.get("/verifytoken", controller.verifySsoToken);
router.post("/logout", controller.logout);
router.post("/register", controller.register)

module.exports = router;
