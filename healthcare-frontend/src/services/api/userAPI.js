// src/api/userAPI.js - API Cá nhân & Hỗ trợ (Phiên bản tinh gọn 2025)
// Chỉ giữ lại các hàm dành cho người dùng cá nhân và một số hàm hỗ trợ UI
import axios from '../axios';

const userAPI = {
  // ==================================================================
  // 1. HỒ SƠ CÁ NHÂN
  // ==================================================================
  getMyProfile: async () => axios.get('/users/profile'),
  updateMyProfile: async (profileData) => axios.put('/users/profile', profileData),
  changePassword: async (data) => axios.post('/users/change-password', data),
  uploadAvatar: async (formData) => axios.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // ==================================================================
  // 2. XÁC THỰC EMAIL
  // ==================================================================
  verifyEmail: async (token) => axios.post('/users/verify-email', { token }),
  resendVerificationEmail: async () => axios.post('/users/resend-verification'),

  // ==================================================================
  // 3. HỖ TRỢ UI
  // ==================================================================
  getRoles: async () => axios.get('/roles'),
  getCreatableRoles: async () => axios.get('/roles/creatable'),
  getPermissionsByRole: async (role) => axios.get(`/roles/${role}/permissions`),
  getAllPermissions: async () => axios.get('/permissions'),

  // ==================================================================
  // 4. ĐĂNG KÝ BỆNH NHÂN TỰ DO
  // ==================================================================
  registerPatient: async (patientData) => axios.post('/register/patient', patientData),

  // ==================================================================
  // 5. QUẢN LÝ USER (ADMIN)
  // ==================================================================
  getUserById: async (userId) => axios.get(`/admin/users/${userId}`),
  updateUser: async (userId, userData, config = {}) => axios.put(`/admin/users/${userId}`, userData, config),
  disableUser: async (userId) => axios.patch(`/admin/users/${userId}/disable`),
  enableUser: async (userId) => axios.patch(`/admin/users/${userId}/enable`),
  deleteUser: async (userId) => axios.delete(`/admin/users/${userId}`),
  changeUserRole: async (userId, data) => axios.patch(`/admin/users/${userId}/role`, data),
};

export default userAPI;