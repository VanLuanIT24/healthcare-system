// src/services/api/admin/adminAPI.js
import axios from '../../axios';

const adminAPI = {
  // Dashboard Stats
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
    return await axios.get(`/notifications?limit=${limit}`);
  },

  getReportsOverview: async () => {
    return await axios.get('/admin/reports/overview');
  },

  // Users Management
  getUsers: async (params = {}) => {
    return await axios.get('/admin/users', { params });
  },

  getDeletedUsers: async (params = {}) => {
    return await axios.get('/admin/users/deleted', { params });
  },

  getUserDetail: async (userId) => {
    return await axios.get(`/admin/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return await axios.put(`/admin/users/${userId}`, userData);
  },

  updateUserRole: async (userId, role) => {
    return await axios.patch(`/admin/users/${userId}/role`, { role });
  },

  disableUser: async (userId) => {
    return await axios.patch(`/admin/users/${userId}/disable`);
  },

  createUser: async (userData) => {
    return await axios.post('/admin/users', userData);
  },

  enableUser: async (userId) => {
    return await axios.patch(`/admin/users/${userId}/enable`);
  },

  deleteUser: async (userId, reason = '') => {
    return await axios.delete(`/admin/users/${userId}`, { 
      data: { reason } 
    });
  },

  restoreUser: async (userId) => {
    return await axios.post(`/admin/users/${userId}/restore`);
  },

  // Reference Data
  getRoles: async () => {
    return await axios.get('/admin/roles');
  },

  getDepartments: async () => {
    return await axios.get('/admin/departments');
  },
};

export default adminAPI;
