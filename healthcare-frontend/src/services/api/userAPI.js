// 👥 User Management API
import axios from '../axios';

const userAPI = {
  // Get all users
  getUsers: async (params) => {
    return await axios.get('/users', { params });
  },

  // Get user by ID
  getUserById: async (id) => {
    return await axios.get(`/users/${id}`);
  },

  // Create user
  createUser: async (userData) => {
    return await axios.post('/users', userData);
  },

  // Update user
  updateUser: async (id, userData) => {
    return await axios.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id) => {
    return await axios.delete(`/users/${id}`);
  },

  // Disable user
  disableUser: async (id) => {
    return await axios.patch(`/users/${id}/disable`);
  },

  // Enable user
  enableUser: async (id) => {
    return await axios.patch(`/users/${id}/enable`);
  },

  // Get user permissions
  getUserPermissions: async (id) => {
    return await axios.get(`/users/${id}/permissions`);
  },

  // Update user role
  updateUserRole: async (id, role) => {
    return await axios.patch(`/users/${id}/role`, { role });
  },

  // Search users
  searchUsers: async (query) => {
    return await axios.get('/users/search', { params: { q: query } });
  },

  // Get users by role
  getUsersByRole: async (role) => {
    return await axios.get('/users/by-role', { params: { role } });
  },

  // Get user statistics
  getUserStats: async () => {
    return await axios.get('/users/stats');
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    return await axios.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get current user profile
  getUserProfile: async () => {
    return await axios.get('/users/profile');
  },

  // Update current user profile
  updateUserProfile: async (profileData) => {
    return await axios.put('/users/profile', profileData);
  },

  // Restore deleted user
  restoreUser: async (id) => {
    return await axios.post(`/users/${id}/restore`);
  },

  // Get deleted users
  getDeletedUsers: async (params) => {
    return await axios.get('/users/deleted', { params });
  },

  // Verify email
  verifyEmail: async (token) => {
    return await axios.post('/users/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (id) => {
    return await axios.post(`/users/${id}/resend-verification`);
  },
};

export default userAPI;
