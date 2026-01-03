// src/routes/message.routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Protect all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Lấy danh sách cuộc trò chuyện
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cuộc trò chuyện
 */
// Conversation routes
router.get('/conversations', messageController.getConversations);

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Lấy tin nhắn trong cuộc trò chuyện
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 */
// Message routes
router.get('/:conversationId', messageController.getMessages);

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gửi thành công
 */
router.post('/send', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/read/{messageId}:
 *   patch:
 *     summary: Đánh dấu tin nhắn đã đọc
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 */
router.patch('/read/:messageId', messageController.markRead);

module.exports = router;
