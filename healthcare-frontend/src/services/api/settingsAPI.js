import axios from '../axios';

// Settings API client
const settingsAPI = {
  // ===== CẤUU HÌNH HỆ THỐNG =====
  getSystemSettings: async () => 
    axios.get('/api/settings'),
  
  updateSystemSettings: async (data) => 
    axios.put('/api/settings', data),

  // ===== QUẢN LÝ VAI TRÒ & QUYỀN =====
  getRoles: async () => 
    axios.get('/api/settings/roles'),
  
  updateRolePermissions: async (roleId, permissions) => 
    axios.put(`/api/settings/roles/${roleId}/permissions`, { permissions }),

  // ===== NHẬT KÝ HOẠT ĐỘNG =====
  getAuditLogs: async (params = {}) => 
    axios.get('/api/settings/audit-logs', { params }),
  
  getAuditLogsStats: async (params = {}) => 
    axios.get('/api/settings/audit-logs/stats', { params }),

  // ===== SAO LƯU & PHỤC HỒI =====
  createBackup: async () => 
    axios.post('/api/settings/backup'),
  
  listBackups: async () => 
    axios.get('/api/settings/backups'),
  
  restoreBackup: async (backupId) => 
    axios.post('/api/settings/backups/restore', { backupId }),

  // ===== KIỂM TRA SỨC KHỎE HỆ THỐNG =====
  getSystemHealth: async () => 
    axios.get('/api/settings/system-health'),
};

export default settingsAPI;

