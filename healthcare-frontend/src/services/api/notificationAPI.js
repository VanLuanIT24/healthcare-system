// src/api/notificationAPI.js - API Quản lý Thông báo & Nhắc nhở (Hoàn chỉnh - Phối hợp liên khoa)
import axios from '../axios';

const notificationAPI = {
  // ===== THÔNG BÁO CÁ NHÂN =====
  getMyNotifications: async (params = {}) => axios.get('/notifications', { params }),
  getUnreadCount: async () => axios.get('/notifications/unread-count'),
  markAsRead: async (notificationId) => axios.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: async () => axios.patch('/notifications/read-all'),

  // ===== GỬI THÔNG BÁO =====
  sendNotification: async (data) => axios.post('/notifications', data),
  sendBulkNotifications: async (data) => axios.post('/notifications/bulk', data),

  // ===== THÔNG BÁO HỆ THỐNG & TỰ ĐỘNG =====
  getSystemNotifications: async (params = {}) => axios.get('/notifications/system', { params }),
  triggerReminder: async (type, referenceId) => axios.post(`/notifications/reminders/${type}/${referenceId}`),

  // ===== LỊCH SỬ THÔNG BÁO =====
  getNotificationHistory: async (params = {}) => axios.get('/notifications/history', { params }),
};

export default notificationAPI;