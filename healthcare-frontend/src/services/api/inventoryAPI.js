// src/api/inventoryAPI.js - API Quản lý Vật tư (Phiên bản đầy đủ 2025 - Liên kết: Adjust stock từ lab/pharmacy, không liên quan thuốc)
import axios from '../axios';

const inventoryAPI = {
  // ===== DANH MỤC VẬT TƯ =====
  getItems: async (params = {}) => axios.get('/api/inventory/items', { params }),
  getItemById: async (id) => axios.get(`/api/inventory/items/${id}`),
  searchItems: async (query, params = {}) => axios.get('/api/inventory/items/search', { params: { q: query, ...params } }),
  createItem: async (data) => axios.post('/api/inventory/items', data),
  updateItem: async (id, data) => axios.put(`/api/inventory/items/${id}`, data),

  // ===== QUẢN LÝ TỒN KHO =====
  adjustStock: async (itemId, data) => axios.post(`/api/inventory/items/${itemId}/adjust`, data),
  receiveStock: async (itemId, batchData) => axios.post(`/api/inventory/items/${itemId}/receive`, batchData),
  issueStock: async (itemId, data) => axios.post(`/api/inventory/items/${itemId}/issue`, data),

  // ===== CẢNH BÁO =====
  getLowStockAlerts: async () => axios.get('/api/inventory/alerts/low-stock'),
  getExpiringAlerts: async (days = 60) => axios.get('/api/inventory/alerts/expiring', { params: { days } }),

  // ===== THỐNG KÊ =====
  getInventoryValue: async () => axios.get('/api/inventory/value'),
  getUsageStats: async (params = {}) => axios.get('/api/inventory/stats/usage', { params }),
  exportInventoryExcel: async (params = {}) => axios.get('/api/inventory/export/excel', { params, responseType: 'blob' }),
};

export default inventoryAPI;