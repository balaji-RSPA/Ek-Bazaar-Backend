const express = require("express");
const { Router } = express;
const router = Router();
const { authenticate } = require('../../middleware/auth')

const chat = require('../../controllers/web/rocketChatController')
const chatTemplates = require('../../controllers/web/languageTempateController')

router.post('/chat/login', chat.userLogin);
// router.post('/chat/logout', authenticate, chat.userLogout);
router.post('/chat/register', chat.createUser);
router.get('/chat/getList', authenticate, chat.userList);
router.get('/chat/getHistory', authenticate, chat.getHistory);
router.post('/chat/markAsRead', authenticate, chat.markAsRead);
router.post('/chat/sendMessage', authenticate, chat.sendMessage);
router.post('/chat/setLanguage', authenticate, chat.setLanguage);
router.post('/chat/checkSellerChat', authenticate, chat.checkSellerChat);
router.post('/chat/logout',/*  authenticate,  */chat.chatLogout);
// router.get('/chat/getUserDetails', chat.userDetails);

router.post('/chat/delete', chat.deleteUser);
router.get('/chat/openChatRoom', chat.openRoom);
router.get('/chat/searchMessage', chat.searchMessage);
router.get('/chat/getNotofication', chat.getNotification);

router.post("/chat/support", chat.contactSupport)
// router.post("/chat/delete", chat.deleteChatAccount)

router.post('/uploadChatLanguageCategory', chatTemplates.uploadChatLanguageCategory);
router.post('/uploadChatLanguageCategoryOne', chatTemplates.uploadChatLanguageCategoryOne);
router.post('/uploadChatLanguageQuestions', chatTemplates.uploadChatLanguageQuestions);
router.post('/uploadChatLanguageQuestionsOne', chatTemplates.uploadChatLanguageQuestionsOne);

router.post('/uploadL4ChatCategory', chatTemplates.uploadL4ChatLanguageTemplate);
router.post('/uploadL4ChatCategoryOne', chatTemplates.uploadL4ChatLanguageTemplateOne)
router.post('/uploadL4ChatLanguageQuestions',chatTemplates.uploadL4ChatLanguageQuestions);
router.post('/uploadL4ChatLanguageQuestionsOne', chatTemplates.uploadL4ChatLanguageQuestionsOne);

router.post('/uploadL5ChatCategory', chatTemplates.uploadeL5ChatLanguageTemplate);
router.post('/uploadL5ChatCategoryOne', chatTemplates.uploadeL5ChatLanguageTemplateOne);
router.post('/uploadL5ChatLanguageQuestion', chatTemplates.uploadL5ChatLanguageQuestions)
router.post('/uploadL5ChatLanguageQuestionOne', chatTemplates.uploadL5ChatLanguageQuestionsOne)

router.get('/chatAllTemplates', chatTemplates.getAllChatTemplates);
router.get('/chatTemplate/:id', chatTemplates.getChatTemplate);

module.exports = router;