// src/api/bedManagementAPI.js - API Quản lý Giường (Phiên bản đầy đủ 2025 - Liên kết: Admit patient → Assign bed → Discharge)
import axios from '../axios';

const bedManagementAPI = {
  // ===== QUẢN LÝ PHÒNG & GIƯỜNG =====
  getBeds: async (params = {}) => axios.get('/beds', { params }),
  getBedById: async (id) => axios.get(`/beds/${id}`),
  getRooms: async (params = {}) => axios.get('/rooms', { params }),
  createRoom: async (data) => axios.post('/rooms', data),
  updateBedStatus: async (bedId, status) => axios.patch(`/beds/${bedId}/status`, { status }),

  // ===== PHÂN BỔ GIƯỜNG =====
  assignBed: async (patientId, bedId, data = {}) => axios.post(`/beds/${bedId}/assign`, { patientId, ...data }),
  transferBed: async (bedId, newBedId, reason = '') => axios.patch(`/beds/${bedId}/transfer`, { newBedId, reason }),
  dischargeFromBed: async (bedId, data = {}) => axios.patch(`/beds/${bedId}/discharge`, data),

  // ===== THỐNG KÊ =====
  getOccupancyRate: async (params = {}) => axios.get('/beds/occupancy', { params }),
  getAvailableBeds: async (params = {}) => axios.get('/beds/available', { params }),
  getBedStats: async (params = {}) => axios.get('/beds/stats', { params }),
};

export default bedManagementAPI;