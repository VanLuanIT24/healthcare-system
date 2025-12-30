// src/models/conversation.model.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            required: true
        }
    }],
    lastMessage: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED', 'BLOCKED'],
        default: 'ACTIVE'
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure a conversation between two specific users is unique if we want one-on-one chats
conversationSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
