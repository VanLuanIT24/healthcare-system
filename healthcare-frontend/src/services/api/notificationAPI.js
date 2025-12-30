// src/api/notificationAPI.js - API Quản lý Thông báo & Nhắc nhở (Hoàn chỉnh - Phối hợp liên khoa)
import axios from '../axios';

const notificationAPI = {
  // ===== THÔNG BÁO CÁ NHÂN =====
  getMyNotifications: async (params = {}) => axios.get('/api/notifications', { params }),
  getUnreadCount: async () => axios.get('/api/notifications/unread-count'),
  markAsRead: async (notificationId) => axios.patch(`/api/notifications/${notificationId}/read`),
  markAllAsRead: async () => axios.patch('/api/notifications/read-all'),

  // ===== GỬI THÔNG BÁO =====
  sendNotification: async (data) => axios.post('/api/notifications', data),
  sendBulkNotifications: async (data) => axios.post('/api/notifications/bulk', data),

  // ===== THÔNG BÁO HỆ THỐNG & TỰ ĐỘNG =====
  getSystemNotifications: async (params = {}) => axios.get('/api/notifications/system', { params }),
  triggerReminder: async (type, referenceId) => axios.post(`/api/notifications/reminders/${type}/${referenceId}`),

  // ===== LỊCH SỬ THÔNG BÁO =====
  getNotificationHistory: async (params = {}) => axios.get('/api/notifications/history', { params }),
};

export default notificationAPI;