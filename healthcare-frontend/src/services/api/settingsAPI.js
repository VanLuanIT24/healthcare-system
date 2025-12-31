import axios from '../axios';

// Settings API client
const settingsAPI = {
  // ===== CẤUU HÌNH HỆ THỐNG =====
  getSystemSettings: async () => 
    axios.get('/settings'),
  
  updateSystemSettings: async (data) => 
    axios.put('/settings', data),

  // ===== QUẢN LÝ VAI TRÒ & QUYỀN =====
  getRoles: async () => 
    axios.get('/settings/roles'),
  
  updateRolePermissions: async (roleId, permissions) => 
    axios.put(`/settings/roles/${roleId}/permissions`, { permissions }),

  // ===== NHẬT KÝ HOẠT ĐỘNG =====
  getAuditLogs: async (params = {}) => 
    axios.get('/settings/audit-logs', { params }),
  
  getAuditLogsStats: async (params = {}) => 
    axios.get('/settings/audit-logs/stats', { params }),

  // ===== SAO LƯU & PHỤC HỒI =====
  createBackup: async () => 
    axios.post('/settings/backup'),
  
  listBackups: async () => 
    axios.get('/settings/backups'),
  
  restoreBackup: async (backupId) => 
    axios.post('/settings/backups/restore', { backupId }),

  // ===== KIỂM TRA SỨC KHỎE HỆ THỐNG =====
  getSystemHealth: async () => 
    axios.get('/settings/system-health'),
};

export default settingsAPI;

