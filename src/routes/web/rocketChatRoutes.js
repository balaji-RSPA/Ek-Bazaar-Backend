const express = require("express");
const { Router } = express;
const router = Router();
const { authenticate } = require('../../middleware/auth')

const chat = require('../../controllers/web/rocketChatController')

router.post('/chat/login', chat.userLogin);
// router.post('/chat/logout', authenticate, chat.userLogout);
router.post('/chat/register', chat.createUser);
router.get('/chat/getList', authenticate, chat.userList);
router.get('/chat/getHistory', authenticate, chat.getHistory);
router.post('/chat/markAsRead', authenticate, chat.markAsRead);
router.post('/chat/sendMessage', authenticate, chat.sendMessage);
router.post('/chat/setLanguage', authenticate, chat.setLanguage);
router.post('/chat/checkSellerChat', chat.checkSellerChat);
router.post('/chat/logout',/*  authenticate,  */chat.chatLogout);
// router.get('/chat/getUserDetails', chat.userDetails);

router.post('/chat/delete', chat.deleteUser);
router.get('/chat/openChatRoom', chat.openRoom);
router.get('/chat/searchMessage', chat.searchMessage);
router.get('/chat/getNotofication', chat.getNotification);

router.post("/chat/support", chat.contactSupport)

module.exports = router;