// src/api/bedManagementAPI.js - API Quản lý Giường (Phiên bản đầy đủ 2025 - Liên kết: Admit patient → Assign bed → Discharge)
import axios from '../axios';

const bedManagementAPI = {
  // ===== QUẢN LÝ PHÒNG & GIƯỜNG =====
  getBeds: async (params = {}) => axios.get('/api/beds', { params }),
  getBedById: async (id) => axios.get(`/api/beds/${id}`),
  getRooms: async (params = {}) => axios.get('/api/rooms', { params }),
  createRoom: async (data) => axios.post('/api/rooms', data),
  updateBedStatus: async (bedId, status) => axios.patch(`/api/beds/${bedId}/status`, { status }),

  // ===== PHÂN BỔ GIƯỜNG =====
  assignBed: async (patientId, bedId, data = {}) => axios.post(`/api/beds/${bedId}/assign`, { patientId, ...data }),
  transferBed: async (bedId, newBedId, reason = '') => axios.patch(`/api/beds/${bedId}/transfer`, { newBedId, reason }),
  dischargeFromBed: async (bedId, data = {}) => axios.patch(`/api/beds/${bedId}/discharge`, data),

  // ===== THỐNG KÊ =====
  getOccupancyRate: async (params = {}) => axios.get('/api/beds/occupancy', { params }),
  getAvailableBeds: async (params = {}) => axios.get('/api/beds/available', { params }),
  getBedStats: async (params = {}) => axios.get('/api/beds/stats', { params }),
};

export default bedManagementAPI;