// ⚙️ Admin & System API
import axios from '../axios';

const adminAPI = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    return await axios.get('/admin/dashboard/stats');
  },

  getRevenueChart: async () => {
    return await axios.get('/admin/dashboard/revenue-chart');
  },

  getDepartmentStats: async () => {
    return await axios.get('/admin/dashboard/departments');
  },

  getPatientDistribution: async () => {
    return await axios.get('/admin/dashboard/patient-distribution');
  },

  getRecentActivities: async (params) => {
    return await axios.get('/admin/dashboard/recent-activities', { params });
  },

  getSystemHealth: async () => {
    return await axios.get('/admin/system/health');
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    return await axios.get('/admin/audit-logs', { params });
  },

  getAuditLogById: async (id) => {
    return await axios.get(`/admin/audit-logs/${id}`);
  },

  exportAuditLogs: async (params) => {
    return await axios.get('/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    });
  },

  // System Settings
  getSettings: async () => {
    return await axios.get('/admin/settings');
  },

  updateSettings: async (settings) => {
    return await axios.put('/admin/settings', settings);
  },

  // Super Admin
  createSuperAdmin: async (adminData) => {
    return await axios.post('/super-admin/create', adminData);
  },

  updateSuperAdmin: async (adminData) => {
    return await axios.put('/super-admin/update', adminData);
  },

  resetSuperAdminPassword: async (newPassword) => {
    return await axios.post('/super-admin/reset-password', { password: newPassword });
  },

  // System Monitoring
  getSystemMetrics: async (timeRange) => {
    return await axios.get('/admin/monitoring/metrics', { params: { timeRange } });
  },

  getDatabaseStatus: async () => {
    return await axios.get('/admin/monitoring/database');
  },

  getErrorLogs: async (params) => {
    return await axios.get('/admin/monitoring/errors', { params });
  },

  // Backup & Maintenance
  createBackup: async () => {
    return await axios.post('/admin/backup/create');
  },

  getBackupHistory: async () => {
    return await axios.get('/admin/backup/history');
  },

  restoreBackup: async (backupId) => {
    return await axios.post(`/admin/backup/${backupId}/restore`);
  },

  toggleMaintenanceMode: async (enabled) => {
    return await axios.post('/admin/maintenance-mode', { enabled });
  },
};

export default adminAPI;
