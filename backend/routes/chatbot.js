const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

console.log('Chatbot route loaded');

router.post('/', chatbotController.handleChatbotQuery);

module.exports = router;