// src/api/adminAPI.js - API Quản trị Toàn diện (Phiên bản cuối cùng 2025)
// Bao gồm: Quản lý User + Phân quyền + Khoa/Phòng ban + Báo cáo nâng cao + Audit + Config + Backup
// ĐÃ GỘP HOÀN TOÀN từ departmentAPI và reportAPI → Không cần 2 file đó nữa
import axios from '../axios';

const adminAPI = {
  // ==================================================================
  // 1. QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
  // ==================================================================
  getUsers: async (params = {}) => axios.get('/api/users', { params }),
  getDeletedUsers: async (params = {}) => axios.get('/api/users/deleted', { params }),
  getUserById: async (id) => axios.get(`/api/users/${id}`),
  updateUser: async (id, userData) => axios.put(`/api/users/${id}`, userData),
  updateUserRole: async (id, role) => axios.patch(`/api/users/${id}/role`, { role }),
  disableUser: async (id) => axios.patch(`/api/users/${id}/disable`),
  enableUser: async (id) => axios.patch(`/api/users/${id}/enable`),
  restoreUser: async (id) => axios.post(`/api/users/${id}/restore`),
  deleteUser: async (id) => axios.delete(`/api/users/${id}`),

  searchUsers: async (query, params = {}) => axios.get('/api/users/search', { params: { q: query, ...params } }),
  getUsersByRole: async (role, params = {}) => axios.get('/api/users/by-role', { params: { role, ...params } }),
  getUsersByDepartment: async (departmentId, params = {}) => axios.get('/api/users/by-department', { params: { department: departmentId, ...params } }),
  getUserStats: async () => axios.get('/api/users/stats'),

  // Đăng ký nhân viên theo role (chỉ creatable roles)
  registerReceptionist: async (data) => axios.post('/api/register/receptionist', data),
  registerBillingStaff: async (data) => axios.post('/api/register/billing-staff', data),
  registerLabTechnician: async (data) => axios.post('/api/register/lab-technician', data),
  registerPharmacist: async (data) => axios.post('/api/register/pharmacist', data),
  registerNurse: async (data) => axios.post('/api/register/nurse', data),
  registerDoctor: async (data) => axios.post('/api/register/doctor', data),
  registerDepartmentHead: async (data) => axios.post('/api/register/department-head', data),
  registerHospitalAdmin: async (data) => axios.post('/api/register/hospital-admin', data), // Chỉ SUPER_ADMIN

  // Phân quyền & roles
  getRoles: async () => axios.get('/api/roles'),
  getCreatableRoles: async () => axios.get('/api/roles/creatable'),
  getPermissionsByRole: async (role) => axios.get(`/api/roles/${role}/permissions`),
  getUserPermissions: async (userId) => axios.get(`/api/users/${userId}/permissions`),
  getAllPermissions: async () => axios.get('/api/permissions'),

  // ==================================================================
  // 2. QUẢN LÝ KHOA / PHÒNG BAN (Gộp từ departmentAPI)
  // ==================================================================
  getDepartments: async (params = {}) => axios.get('/api/admin/departments', { params }),
  getDepartmentById: async (id) => axios.get(`/api/admin/departments/${id}`),
  createDepartment: async (data) => axios.post('/api/admin/departments', data),
  updateDepartment: async (id, data) => axios.put(`/api/admin/departments/${id}`, data),
  deleteDepartment: async (id) => axios.delete(`/api/admin/departments/${id}`),

  getUsersInDepartment: async (departmentId, params = {}) => axios.get(`/api/admin/departments/${departmentId}/users`, { params }),
  assignHeadToDepartment: async (departmentId, userId) => axios.post(`/api/admin/departments/${departmentId}/head`, { userId }),

  getDepartmentStats: async (departmentId, params = {}) => axios.get(`/api/admin/departments/${departmentId}/stats`, { params }),
  getDepartmentAppointments: async (departmentId, params = {}) => axios.get(`/api/admin/departments/${departmentId}/appointments`, { params }),
  getDepartmentRevenue: async (departmentId, params = {}) => axios.get(`/api/admin/departments/${departmentId}/revenue`, { params }),
  getDepartmentSchedule: async (departmentId, params = {}) => axios.get(`/api/admin/departments/${departmentId}/schedule`, { params }),

  // ==================================================================
  // 3. BÁO CÁO NÂNG CAO & XUẤT DỮ LIỆU (Gộp hoàn toàn từ reportAPI)
  // ==================================================================
  // Lâm sàng
  getPatientCensusReport: async (params = {}) => axios.get('/api/reports/clinical/patient-census', { params }),
  getDiagnosisStatistics: async (params = {}) => axios.get('/api/reports/clinical/diagnosis-stats', { params }),
  getDiseaseTrendReport: async (params = {}) => axios.get('/api/reports/clinical/disease-trend', { params }),
  getReadmissionReport: async (params = {}) => axios.get('/api/reports/clinical/readmission', { params }),
  getTreatmentOutcomeReport: async (params = {}) => axios.get('/api/reports/clinical/treatment-outcomes', { params }),

  // Tài chính
  getRevenueReport: async (params = {}) => axios.get('/api/reports/financial/revenue', { params }),
  getRevenueByDepartment: async (params = {}) => axios.get('/api/reports/financial/by-department', { params }),
  getRevenueByDoctor: async (params = {}) => axios.get('/api/reports/financial/by-doctor', { params }),
  getARAgingReport: async (params = {}) => axios.get('/api/reports/financial/ar-aging', { params }),
  getInsuranceClaimReport: async (params = {}) => axios.get('/api/reports/financial/insurance-claims', { params }),
  getOutstandingBillsReport: async (params = {}) => axios.get('/api/reports/financial/outstanding', { params }),

  // Dược & Kho
  getMedicationUsageReport: async (params = {}) => axios.get('/api/reports/pharmacy/medication-usage', { params }),
  getTopPrescribedMedications: async (params = {}) => axios.get('/api/reports/pharmacy/top-prescribed', { params }),
  getInventoryValueReport: async (params = {}) => axios.get('/api/reports/pharmacy/inventory-value', { params }),
  getStockMovementReport: async (params = {}) => axios.get('/api/reports/pharmacy/stock-movement', { params }),
  getExpiringMedicationReport: async (params = {}) => axios.get('/api/reports/pharmacy/expiring', { params }),

  // Nhân sự
  getStaffAttendanceReport: async (params = {}) => axios.get('/api/reports/hr/attendance', { params }),
  getDoctorWorkloadReport: async (params = {}) => axios.get('/api/reports/hr/doctor-workload', { params }),
  getStaffPerformanceReport: async (params = {}) => axios.get('/api/reports/hr/performance', { params }),

  // Hệ thống
  getUserActivityReport: async (params = {}) => axios.get('/api/reports/system/user-activity', { params }),
  getAuditLogReport: async (params = {}) => axios.get('/api/reports/system/audit-logs', { params }),
  getLoginHistoryReport: async (params = {}) => axios.get('/api/reports/system/login-history', { params }),

  // Xuất báo cáo chung (PDF / Excel)
  exportReportToPDF: async (type, params = {}) => 
    axios.get(`/api/reports/${type}/export/pdf`, { params, responseType: 'blob' }),
  exportReportToExcel: async (type, params = {}) => 
    axios.get(`/api/reports/${type}/export/excel`, { params, responseType: 'blob' }),

  // Báo cáo tùy chỉnh
  getReportTemplates: async () => axios.get('/api/reports/templates'),
  saveReportTemplate: async (template) => axios.post('/api/reports/templates', template),
  updateReportTemplate: async (id, template) => axios.put(`/api/reports/templates/${id}`, template),
  deleteReportTemplate: async (id) => axios.delete(`/api/reports/templates/${id}`),
  executeCustomReport: async (templateId, params = {}) => axios.post(`/api/reports/custom/${templateId}/run`, params),

  // ==================================================================
  // 4. AUDIT LOG & HOẠT ĐỘNG HỆ THỐNG
  // ==================================================================
  getSystemAuditLogs: async (params = {}) => axios.get('/api/audit-logs', { params }),
  getUserAuditLogs: async (userId, params = {}) => axios.get(`/api/audit-logs/user/${userId}`, { params }),

  // ==================================================================
  // 5. CẤU HÌNH HỆ THỐNG
  // ==================================================================
  getSystemConfig: async () => axios.get('/api/admin/config'),
  updateSystemConfig: async (config) => axios.put('/api/admin/config', config),
  getHospitalInfo: async () => axios.get('/api/admin/hospital-info'),
  updateHospitalInfo: async (data) => axios.put('/api/admin/hospital-info', data),

  triggerBackup: async () => axios.post('/api/admin/backup'),
  getBackupList: async () => axios.get('/api/admin/backups'),
  restoreBackup: async (backupId) => axios.post(`/api/admin/restore/${backupId}`),

  // ==================================================================
  // 6. TIỆN ÍCH DOWNLOAD (Dùng chung cho tất cả báo cáo)
  // ==================================================================
  downloadBlob: (blob, filename = 'bao_cao.pdf') => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

export { adminAPI };
export default adminAPI;