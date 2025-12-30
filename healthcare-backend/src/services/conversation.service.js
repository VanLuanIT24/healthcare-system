// src/services/conversation.service.js
const Conversation = require('../models/conversation.model');
const { AppError } = require('../middlewares/error.middleware');

class ConversationService {
    async getOrCreateConversation(participants) {
        // Find conversation with exact participants
        // For 1-on-1, look for a conversation containing all participant IDs
        const userIds = participants.map(p => p.user.toString());

        let conversation = await Conversation.findOne({
            'participants.user': { $all: userIds },
            participants: { $size: userIds.length }
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants });
        }

        return conversation;
    }

    async getUserConversations(userId) {
        console.log('🔍 [ConversationService] Getting conversations for user:', userId);
        const conversations = await Conversation.find({
            'participants.user': userId,
            status: 'ACTIVE'
        })
            .populate('participants.user', 'personalInfo role')
            .sort({ updatedAt: -1 });

        console.log(`📊 [ConversationService] Found ${conversations.length} conversations`);
        if (conversations.length > 0) {
            console.log('   - First ID:', conversations[0]._id);
        }
        return conversations;
    }

    async getConversationById(id, userId) {
        const conversation = await Conversation.findById(id)
            .populate('participants.user', 'personalInfo role');

        if (!conversation) throw new AppError('Không tìm thấy cuộc hội thoại', 404);

        // Check if user is a participant
        const isParticipant = conversation.participants.some(p => p.user._id.toString() === userId.toString());
        if (!isParticipant) throw new AppError('Bạn không có quyền truy cập cuộc hội thoại này', 403);

        return conversation;
    }
}

module.exports = new ConversationService();
