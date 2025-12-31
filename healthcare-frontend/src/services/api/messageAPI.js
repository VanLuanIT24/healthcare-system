// src/services/api/messageAPI.js
import axiosInstance from '../axios';

const messageAPI = {
    // Get all conversations for current user
    getConversations: () => axiosInstance.get('/messages/conversations'),

    // Get message history for a conversation
    getMessages: (conversationId, params) =>
        axiosInstance.get(`/messages/${conversationId}`, { params }),

    // Send a new message
    sendMessage: (data) => axiosInstance.post('/messages/send', data),

    // Mark a message as read
    markRead: (messageId) => axiosInstance.patch(`/messages/read/${messageId}`),
};

export default messageAPI;
