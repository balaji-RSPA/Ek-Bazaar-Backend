const express = require("express");
const { Router } = express;
const router = Router();

const chat = require('../../controllers/web/rocketChatController')

router.post('/chat/login', chat.userLogin);
router.post('/chat/logout', chat.userLogout);
router.get('/chat/getUserDetails', chat.userDetails);
router.post('/chat/register', chat.createUser);
router.post('/chat/delete', chat.deleteUser);
router.get('/chat/getList', chat.userList);
router.get('/chat/openChatRoom', chat.openRoom);
router.post('/chat/sendMessage', chat.sendMessage);
router.get('/chat/searchMessage', chat.searchMessage);
router.get('/chat/getHistory', chat.getHistory);

module.exports = router;