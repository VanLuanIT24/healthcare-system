// src/api/laboratoryAPI.js - API Xét nghiệm (Phiên bản đầy đủ 2025 - Liên kết: Create order từ clinical → Record result → Approve → Notify patient)
import axios from '../axios';

const laboratoryAPI = {
  // ===== YÊU CẦU XÉT NGHIỆM =====
  createLabOrder: async (data) => axios.post('/api/laboratory/orders', data),
  getLabOrder: async (id) => axios.get(`/api/laboratory/orders/${id}`),
  getLabOrders: async (params = {}) => axios.get('/api/laboratory/orders', { params }),
  updateLabOrder: async (id, data) => axios.put(`/api/laboratory/orders/${id}`, data),
  cancelLabOrder: async (id, reason = '') => axios.patch(`/api/laboratory/orders/${id}/cancel`, { reason }),

  // ===== KẾT QUẢ XÉT NGHIỆM =====
  recordLabResult: async (orderId, results) => axios.post(`/api/laboratory/orders/${orderId}/results`, results),
  updateLabResult: async (orderId, testId, result) => axios.patch(`/api/laboratory/orders/${orderId}/results/${testId}`, result),
  approveLabResult: async (orderId, testId) => axios.patch(`/api/laboratory/orders/${orderId}/results/${testId}/approve`),

  // ===== QUY TRÌNH =====
  markSampleCollected: async (orderId) => axios.patch(`/api/laboratory/orders/${orderId}/sample-collected`),
  markTestCompleted: async (orderId, testId) => axios.patch(`/api/laboratory/orders/${orderId}/tests/${testId}/complete`),

  // ===== DANH MỤC =====
  getLabTests: async (params = {}) => axios.get('/api/laboratory/tests', { params }),
  searchLabTests: async (query) => axios.get('/api/laboratory/tests/search', { params: { q: query } }),

  // ===== THEO DÕI & THỐNG KÊ =====
  getPendingOrders: async () => axios.get('/api/laboratory/orders/pending'),
  getCriticalResults: async () => axios.get('/api/laboratory/results/critical'),
  getLabStats: async (params = {}) => axios.get('/api/laboratory/stats', { params }),
  exportLabResultsPDF: async (orderId) => axios.get(`/api/laboratory/orders/${orderId}/report/pdf`, { responseType: 'blob' }),
};

export default laboratoryAPI;