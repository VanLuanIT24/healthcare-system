// src/controllers/message.controller.js
const messageService = require('../services/message.service');
const conversationService = require('../services/conversation.service');
const User = require('../models/user.model');

class MessageController {
    async getConversations(req, res, next) {
        try {
            const conversations = await conversationService.getUserConversations(req.user._id);
            res.json({
                success: true,
                data: conversations
            });
        } catch (error) {
            next(error);
        }
    }

    async getMessages(req, res, next) {
        try {
            const { conversationId } = req.params;
            const query = req.query;
            const messages = await messageService.getConversationMessages(conversationId, req.user._id, query);
            // Frontends usually expect messages in chronological order
            res.json({
                success: true,
                data: messages.reverse()
            });
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req, res, next) {
        try {
            const { recipientId, text, type } = req.body;
            const senderId = req.user._id;

            // Determine roles for conversation if new
            // We can improve this by checking actual roles from User model
            const recipient = await User.findById(recipientId);
            if (!recipient) throw new Error('Không tìm thấy người nhận');

            const participants = [
                { user: senderId, role: req.user.role },
                { user: recipientId, role: recipient.role }
            ];

            // Get or create conversation with correct roles
            const conversation = await conversationService.getOrCreateConversation(participants);

            // Create message
            const message = await messageService.sendMessage(senderId, conversation._id, text, type);

            // Update participants roles to be sure
            conversation.participants = participants;
            await conversation.save();

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            next(error);
        }
    }

    async markRead(req, res, next) {
        try {
            const { messageId } = req.params;
            const message = await messageService.markAsRead(messageId, req.user._id);
            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MessageController();
