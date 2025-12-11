// 🛠️ Admin Extended API - System Monitoring, Backup, Maintenance
import axios from '../axios';

const adminExtendedAPI = {
  /**
   * System Monitoring
   */

  // Get system metrics (CPU, memory, disk, network)
  getSystemMetrics: async (timeRange = '24h') => {
    return await axios.get('/admin/monitoring/metrics', {
      params: { range: timeRange },
    });
  },

  // Get database status and health
  getDatabaseStatus: async () => {
    return await axios.get('/admin/monitoring/database');
  },

  // Get error logs
  getErrorLogs: async (params) => {
    return await axios.get('/admin/monitoring/errors', { params });
  },

  /**
   * Backup & Maintenance
   */

  // Create new backup
  createBackup: async () => {
    return await axios.post('/admin/backup/create');
  },

  // Get backup history
  getBackupHistory: async (params) => {
    return await axios.get('/admin/backup/history', { params });
  },

  // Get specific backup
  getBackupById: async (backupId) => {
    return await axios.get(`/admin/backup/${backupId}`);
  },

  // Restore from backup
  restoreBackup: async (backupId) => {
    return await axios.post(`/admin/backup/${backupId}/restore`);
  },

  // Delete backup
  deleteBackup: async (backupId) => {
    return await axios.delete(`/admin/backup/${backupId}`);
  },

  // Toggle maintenance mode
  toggleMaintenanceMode: async (enabled) => {
    return await axios.post('/admin/maintenance-mode', { enabled });
  },

  // Get maintenance status
  getMaintenanceStatus: async () => {
    return await axios.get('/admin/maintenance-status');
  },

  /**
   * Database Management
   */

  // Optimize database
  optimizeDatabase: async () => {
    return await axios.post('/admin/database/optimize');
  },

  // Check database integrity
  checkDatabaseIntegrity: async () => {
    return await axios.post('/admin/database/check-integrity');
  },

  // Get database statistics
  getDatabaseStats: async () => {
    return await axios.get('/admin/database/stats');
  },

  /**
   * Log Management
   */

  // Get system logs
  getSystemLogs: async (params) => {
    return await axios.get('/admin/logs/system', { params });
  },

  // Clear logs older than X days
  clearOldLogs: async (days) => {
    return await axios.post('/admin/logs/clear', { days });
  },

  // Export logs
  exportLogs: async (params) => {
    return await axios.get('/admin/logs/export', {
      params,
      responseType: 'blob',
    });
  },

  /**
   * System Configuration
   */

  // Get system configuration
  getSystemConfiguration: async () => {
    return await axios.get('/admin/config/system');
  },

  // Update system configuration
  updateSystemConfiguration: async (config) => {
    return await axios.put('/admin/config/system', config);
  },

  // Get API rate limits
  getApiRateLimits: async () => {
    return await axios.get('/admin/config/rate-limits');
  },

  // Update API rate limits
  updateApiRateLimits: async (limits) => {
    return await axios.put('/admin/config/rate-limits', limits);
  },

  /**
   * Server Status
   */

  // Get overall server health
  getServerHealth: async () => {
    return await axios.get('/admin/server/health');
  },

  // Get server uptime
  getServerUptime: async () => {
    return await axios.get('/admin/server/uptime');
  },

  // Restart services
  restartServices: async (services) => {
    return await axios.post('/admin/server/restart', { services });
  },

  /**
   * Cache Management
   */

  // Clear cache
  clearCache: async (cacheType = 'all') => {
    return await axios.post('/admin/cache/clear', { type: cacheType });
  },

  // Get cache statistics
  getCacheStats: async () => {
    return await axios.get('/admin/cache/stats');
  },

  /**
   * User Session Management
   */

  // Get active sessions
  getActiveSessions: async (params) => {
    return await axios.get('/admin/sessions/active', { params });
  },

  // Kill specific session
  killSession: async (sessionId) => {
    return await axios.post(`/admin/sessions/${sessionId}/kill`);
  },

  // Kill all sessions for user
  killAllUserSessions: async (userId) => {
    return await axios.post(`/admin/sessions/user/${userId}/kill-all`);
  },

  /**
   * Security Management
   */

  // Get security settings
  getSecuritySettings: async () => {
    return await axios.get('/admin/security/settings');
  },

  // Update security settings
  updateSecuritySettings: async (settings) => {
    return await axios.put('/admin/security/settings', settings);
  },

  // Get IP whitelist
  getIpWhitelist: async () => {
    return await axios.get('/admin/security/ip-whitelist');
  },

  // Add IP to whitelist
  addIpToWhitelist: async (ip) => {
    return await axios.post('/admin/security/ip-whitelist', { ip });
  },

  // Remove IP from whitelist
  removeIpFromWhitelist: async (ip) => {
    return await axios.delete(`/admin/security/ip-whitelist/${ip}`);
  },

  /**
   * Notification Management
   */

  // Get notification settings
  getNotificationSettings: async () => {
    return await axios.get('/admin/notifications/settings');
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    return await axios.put('/admin/notifications/settings', settings);
  },

  // Send test notification
  sendTestNotification: async (channel = 'email') => {
    return await axios.post('/admin/notifications/test', { channel });
  },
};

export default adminExtendedAPI;
