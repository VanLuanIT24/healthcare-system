// src/api/authAPI.js - API Xác thực & Quản lý Phiên
import axios from '../axios';

// Environment check for logging
const isDev = import.meta.env?.DEV ?? false;

const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (isDev) console.log('🔐 authAPI.login - Response received');
      return response;
    } catch (error) {
      if (isDev) console.error('🔐 authAPI.login - Error:', error.message);
      throw error;
    }
  },

  register: async (userData) => {
    return await axios.post('/auth/register', userData);
  },

  logout: async (refreshToken) => {
    // If refreshToken provided, send it in body. Otherwise just rely on Authorization header (JWT token)
    const body = refreshToken ? { refreshToken } : {};
    return await axios.post('/auth/logout', body).catch(() => Promise.resolve());
  },

  logoutAll: async (refreshToken) => {
    return await axios.post('/auth/sessions/logout-all', { refreshToken }).catch(() => Promise.resolve());
  },

  refreshToken: async (refreshToken) => {
    return await axios.post('/auth/refresh-token', { refreshToken });
  },

  forgotPassword: async (email) => {
    return await axios.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await axios.post('/auth/reset-password', { token, newPassword });
  },

  verifyEmail: async (token) => {
    // Backend expects token as URL parameter: POST /auth/verify-email/:token
    return await axios.post(`/auth/verify-email/${token}`);
  },

  resendVerification: async (email = null) => {
    return await axios.post('/auth/resend-verification', email ? { email } : {});
  },

  getProfile: async () => {
    try {
      const response = await axios.get('/auth/me');
      if (isDev) console.log('🔐 authAPI.getProfile - User role:', response.data?.data?.user?.role);
      return response;
    } catch (error) {
      if (isDev) console.error('❌ authAPI.getProfile - Failed:', error.message);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    return await axios.put('/auth/profile', profileData);
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await axios.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await axios.post('/auth/avatar', formData);
  },

  // Quản lý phiên đăng nhập
  getUserSessions: async () => axios.get('/auth/sessions'),
  revokeSession: async (sessionId) => axios.post('/auth/sessions/revoke', { sessionId }),
  logoutAllOtherSessions: async () => axios.post('/auth/sessions/logout-all-other'),
  logoutAllSessions: async () => axios.post('/auth/sessions/logout-all'),

  // Kiểm tra sức khỏe hệ thống
  healthCheck: async () => axios.get('/health'),
};

export default authAPI;