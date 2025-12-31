// src/api/laboratoryAPI.js - API Xét nghiệm (Phiên bản đầy đủ 2025 - Liên kết: Create order từ clinical → Record result → Approve → Notify patient)
import axios from '../axios';

const laboratoryAPI = {
  // ===== YÊU CẦU XÉT NGHIỆM =====
  createLabOrder: async (data) => axios.post('/laboratory/orders', data),
  getLabOrder: async (id) => axios.get(`/laboratory/orders/${id}`),
  getLabOrders: async (params = {}) => axios.get('/laboratory/orders', { params }),
  updateLabOrder: async (id, data) => axios.put(`/laboratory/orders/${id}`, data),
  cancelLabOrder: async (id, reason = '') => axios.patch(`/laboratory/orders/${id}/cancel`, { reason }),

  // ===== KẾT QUẢ XÉT NGHIỆM =====
  recordLabResult: async (orderId, results) => axios.post(`/laboratory/orders/${orderId}/results`, results),
  updateLabResult: async (orderId, testId, result) => axios.patch(`/laboratory/orders/${orderId}/results/${testId}`, result),
  approveLabResult: async (orderId, testId) => axios.patch(`/laboratory/orders/${orderId}/results/${testId}/approve`),

  // ===== QUY TRÌNH =====
  markSampleCollected: async (orderId) => axios.patch(`/laboratory/orders/${orderId}/sample-collected`),
  markTestCompleted: async (orderId, testId) => axios.patch(`/laboratory/orders/${orderId}/tests/${testId}/complete`),

  // ===== DANH MỤC =====
  getLabTests: async (params = {}) => axios.get('/laboratory/tests', { params }),
  searchLabTests: async (query) => axios.get('/laboratory/tests/search', { params: { q: query } }),

  // ===== THEO DÕI & THỐNG KÊ =====
  getPendingOrders: async () => axios.get('/laboratory/orders/pending'),
  getCriticalResults: async () => axios.get('/laboratory/results/critical'),
  getLabStats: async (params = {}) => axios.get('/laboratory/stats', { params }),
  exportLabResultsPDF: async (orderId) => axios.get(`/laboratory/orders/${orderId}/report/pdf`, { responseType: 'blob' }),
};

export default laboratoryAPI;