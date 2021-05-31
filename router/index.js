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

router
  .route("/user/login")
  .post(controller.doLogin);
router
  .route("/user/logout")
  .post(controller.logout);
router
  .route("/user")
  .post(controller.register);
router
  .route("/logged")
  .get(controller.login);
router
  .route("/user/rfp")
  .post(controller.postRFP);
router
.route("/setUserLang")
.post(controller.setUserLanguage)
router
.route("/getUserLang")
.get(controller.getUserLanguage)

module.exports = router;
