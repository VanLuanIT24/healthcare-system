// 🔐 Authentication API - COMPLETE & MATCHED WITH BACKEND
import axios from '../axios';

const authAPI = {
  // ✅ Login
  login: async (email, password) => {
    return await axios.post('/auth/login', { email, password });
  },

  // ✅ Logout
  logout: async (refreshToken, sessionId = null) => {
    const body = {};
    if (refreshToken) body.refreshToken = refreshToken;
    if (sessionId) body.sessionId = sessionId;
    return await axios.post('/auth/logout', body);
  },

  // ✅ Refresh token
  refreshToken: async (refreshToken) => {
    return await axios.post('/auth/refresh-token', { refreshToken });
  },

  // ✅ Register user
  register: async (userData) => {
    return await axios.post('/auth/register', userData);
  },

  // ✅ Forgot password
  forgotPassword: async (email) => {
    return await axios.post('/auth/forgot-password', { email });
  },

  // ✅ Reset password (FIXED: correct backend endpoint)
  resetPassword: async (token, newPassword, confirmPassword) => {
    return await axios.post('/auth/reset-password', { 
      token, 
      newPassword, 
      confirmPassword 
    });
  },

  // ✅ Verify email (NEW)
  verifyEmail: async (token) => {
    return await axios.get(`/auth/verify-email/${token}`);
  },

  // ✅ Resend verification email (NEW)
  resendVerification: async (email) => {
    return await axios.post('/auth/resend-verification', { email });
  },

  // ✅ Get current user profile (FIXED: correct endpoint)
  getProfile: async () => {
    return await axios.get('/auth/me');
  },

  // ✅ Change password (FIXED: correct endpoint and parameters)
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await axios.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
  },

  // ✅ Get user sessions (NEW)
  getUserSessions: async () => {
    return await axios.get('/auth/sessions');
  },

  // ✅ Revoke session (NEW)
  revokeSession: async (sessionId) => {
    return await axios.post('/auth/sessions/revoke', { sessionId });
  },

  // ✅ Logout all sessions (NEW)
  logoutAllSessions: async () => {
    return await axios.post('/auth/sessions/logout-all');
  },

  // ✅ Health check
  healthCheck: async () => {
    return await axios.get('/health');
  }
};

export default authAPI;