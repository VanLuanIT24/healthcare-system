// src/services/api/admin/adminAPI.js
import axios from '../../axios';

const adminAPI = {
  // Dashboard Stats - FROM /admin ENDPOINT
  getUsersStats: async () => {
    return await axios.get('/admin/users/stats');
  },

  getDepartmentsStats: async () => {
    return await axios.get('/admin/departments/stats');
  },

  getAppointmentsStats: async () => {
    return await axios.get('/admin/appointments/stats');
  },

  getRecentNotifications: async (limit = 10) => {
    return await axios.get(`/api/notifications?limit=${limit}`);
  },

  getReportsOverview: async () => {
    return await axios.get('/admin/reports/overview');
  },

  // Users Management - FROM /api/admin ENDPOINT
  getUsers: async (params = {}) => {
    return await axios.get('/api/admin/users', { params });
  },

  getDeletedUsers: async (params = {}) => {
    return await axios.get('/api/admin/users/deleted', { params });
  },

  getUserDetail: async (userId) => {
    return await axios.get(`/api/admin/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return await axios.put(`/api/admin/users/${userId}`, userData);
  },

  updateUserRole: async (userId, role) => {
    return await axios.patch(`/api/admin/users/${userId}/role`, { role });
  },

  disableUser: async (userId) => {
    return await axios.patch(`/api/admin/users/${userId}/disable`);
  },

  createUser: async (userData) => {
    return await axios.post('/api/admin/users', userData);
  },

  enableUser: async (userId) => {
    return await axios.patch(`/api/admin/users/${userId}/enable`);
  },

  deleteUser: async (userId, reason = '') => {
    return await axios.delete(`/api/admin/users/${userId}`, { 
      data: { reason } 
    });
  },

  restoreUser: async (userId) => {
    return await axios.post(`/api/admin/users/${userId}/restore`);
  },

  // Reference Data
  getRoles: async () => {
    return await axios.get('/api/admin/roles');
  },

  getDepartments: async () => {
    return await axios.get('/api/admin/departments');
  },
};

export default adminAPI;
