// src/api/queueAPI.js - API Quản lý Hàng đợi (Phiên bản đầy đủ 2025 - Liên kết: Check-in appointment → Add to queue → Call next → Complete → Trigger clinical)
import axios from '../axios';

const queueAPI = {
  // ===== LẤY HÀNG ĐỢI =====
  getQueue: async (params = {}) => axios.get('/api/queue', { params }),
  getTodayQueue: async (params = {}) => axios.get('/api/queue/today', { params }),
  getCurrentPatient: async (doctorId) => axios.get(`/api/queue/current/${doctorId}`),

  // ===== QUẢN LÝ HÀNG ĐỢI =====
  callNext: async (doctorId) => axios.post(`/api/queue/${doctorId}/next`),
  skipPatient: async (queueId, reason = '') => axios.patch(`/api/queue/${queueId}/skip`, { reason }),
  recallPatient: async (queueId) => axios.patch(`/api/queue/${queueId}/recall`),
  completePatient: async (queueId) => axios.patch(`/api/queue/${queueId}/complete`),

  // ===== THÊM VÀO HÀNG ĐỢI =====
  addToQueue: async (appointmentId) => axios.post('/api/queue/add', { appointmentId }),
  addWalkIn: async (patientId, doctorId, reason = '') => axios.post('/api/queue/walk-in', { patientId, doctorId, reason }),

  // ===== THỐNG KÊ =====
  getQueueStats: async (params = {}) => axios.get('/api/queue/stats', { params }),
  getEstimatedWaitTime: async (doctorId) => axios.get(`/api/queue/wait-time/${doctorId}`),
};

export default queueAPI;