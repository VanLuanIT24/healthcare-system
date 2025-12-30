// src/routes/message.routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Protect all routes
router.use(authMiddleware);

// Conversation routes
router.get('/conversations', messageController.getConversations);

// Message routes
router.get('/:conversationId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.patch('/read/:messageId', messageController.markRead);

module.exports = router;
