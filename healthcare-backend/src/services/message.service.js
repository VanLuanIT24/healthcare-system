// src/services/message.service.js
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const conversationService = require('./conversation.service');
const { AppError } = require('../middlewares/error.middleware');

class MessageService {
    async sendMessage(senderId, conversationId, text, type = 'TEXT') {
        // 1. Get conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error('Không tìm thấy cuộc hội thoại');

        // 2. Create message
        const message = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text,
            type
        });

        // 3. Update conversation last message
        await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: {
                text,
                sender: senderId,
                createdAt: new Date()
            }
        });

        return message;
    }

    async getConversationMessages(conversationId, userId, query = {}) {
        // Verify participation
        await conversationService.getConversationById(conversationId, userId);

        const { page = 1, limit = 50 } = query;
        const skip = (page - 1) * limit;

        return await Message.find({ conversationId })
            .populate('sender', 'personalInfo role')
            .sort({ createdAt: -1 }) // Newest first for pagination
            .skip(skip)
            .limit(parseInt(limit));
    }

    async markAsRead(messageId, userId) {
        return await Message.findByIdAndUpdate(messageId, {
            $addToSet: { readBy: { user: userId, readAt: new Date() } }
        }, { new: true });
    }
}

module.exports = new MessageService();
