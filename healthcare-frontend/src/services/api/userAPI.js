// src/api/userAPI.js - API Cá nhân & Hỗ trợ (Phiên bản tinh gọn 2025)
// Chỉ giữ lại các hàm dành cho người dùng cá nhân và một số hàm hỗ trợ UI
import axios from '../axios';

const userAPI = {
  // ==================================================================
  // 1. HỒ SƠ CÁ NHÂN
  // ==================================================================
  getMyProfile: async () => axios.get('/api/users/profile'),
  updateMyProfile: async (profileData) => axios.put('/api/users/profile', profileData),
  changePassword: async (data) => axios.post('/api/users/change-password', data),
  uploadAvatar: async (formData) => axios.post('/api/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // ==================================================================
  // 2. XÁC THỰC EMAIL
  // ==================================================================
  verifyEmail: async (token) => axios.post('/api/users/verify-email', { token }),
  resendVerificationEmail: async () => axios.post('/api/users/resend-verification'),

  // ==================================================================
  // 3. HỖ TRỢ UI
  // ==================================================================
  getRoles: async () => axios.get('/api/roles'),
  getCreatableRoles: async () => axios.get('/api/roles/creatable'),
  getPermissionsByRole: async (role) => axios.get(`/api/roles/${role}/permissions`),
  getAllPermissions: async () => axios.get('/api/permissions'),

  // ==================================================================
  // 4. ĐĂNG KÝ BỆNH NHÂN TỰ DO
  // ==================================================================
  registerPatient: async (patientData) => axios.post('/api/register/patient', patientData),

  // ==================================================================
  // 5. QUẢN LÝ USER (ADMIN)
  // ==================================================================
  getUserById: async (userId) => axios.get(`/api/admin/users/${userId}`),
  updateUser: async (userId, userData, config = {}) => axios.put(`/api/admin/users/${userId}`, userData, config),
  disableUser: async (userId) => axios.patch(`/api/admin/users/${userId}/disable`),
  enableUser: async (userId) => axios.patch(`/api/admin/users/${userId}/enable`),
  deleteUser: async (userId) => axios.delete(`/api/admin/users/${userId}`),
  changeUserRole: async (userId, data) => axios.patch(`/api/admin/users/${userId}/role`, data),
};

export default userAPI;