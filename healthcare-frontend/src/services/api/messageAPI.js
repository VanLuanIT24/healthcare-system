// src/services/api/messageAPI.js
import axiosInstance from '../axios';

const messageAPI = {
    // Get all conversations for current user
    getConversations: () => axiosInstance.get('/api/messages/conversations'),

    // Get message history for a conversation
    getMessages: (conversationId, params) =>
        axiosInstance.get(`/api/messages/${conversationId}`, { params }),

    // Send a new message
    sendMessage: (data) => axiosInstance.post('/api/messages/send', data),

    // Mark a message as read
    markRead: (messageId) => axiosInstance.patch(`/api/messages/read/${messageId}`),
};

export default messageAPI;
