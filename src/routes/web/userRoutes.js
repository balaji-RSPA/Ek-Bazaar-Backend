const express = require("express");
const { Router } = express;
const router = Router();
const user = require("../../controllers/web/userController");
const auth = require("../../controllers/web/authController");
const { authenticate } = require("../../middleware/auth");

router.get("/user/access-token", user.getAccessToken)
router.post("/user/check-user-exist", user.checkUserExistOrNot)
router.post("/user/send-otp", user.sendOtp)
router.post("/user/sendOtpToMail", user.sendOtpToMail)
// router.post("/user/send-sms", user.sendExotelSms)
router.post("/user/verify-mobile", authenticate, user.verifySellerMobile)
router.post("/user/verify-email", user.verifiedEmail)
router.post("/user/email-verification", authenticate, user.verificationEmail)
router.post("/user", user.addUser)
router.post("/user/login", auth.login)
router.post("/user/profile", authenticate, user.getUserProfile)
router.get("/user", authenticate, user.getUserProfile)
router.put("/user", authenticate, user.updateUser)
router.put("/user-update-language", authenticate, user.updateUserLanguage)
router.post("/user/logout", /* authenticate, */ auth.logout)
router.post("/user/forget-password", user.forgetPassword)
router.post("/user/update-password", authenticate, user.updateNewPassword)
router.post("/user/deleteCurrentAccount", authenticate, user.deleteCurrentAccount)
router.get('/user/whatsapp-sms',user.sendWhatappWati)
// router.post("/user/new-password")

module.exports = router;
