// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {
  authenticate,
  requirePermission
} = require('../middlewares/auth.middleware');
const {
  validate
} = require('../middlewares/validation.middleware');
const {
  adminValidation
} = require('../validations/admin.validation');
const { PERMISSIONS } = require('../constants/roles');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/user.model');
const { uploadMiddleware } = require('../middlewares/upload.middleware');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Lấy danh sách bác sĩ - Sử dụng DoctorController để lấy đầy đủ dữ liệu
const doctorController = require('../controllers/doctor.controller');
router.get(
  '/doctors',
  doctorController.getDoctors
);

// ✅ POST /users route
router.post(
  '/users',
  requirePermission(PERMISSIONS['USER_CREATE']),
  validate(adminValidation.createUser, 'body'),
  adminController.createUser
);

// Lấy danh sách users
router.get(
  '/users',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getUsers
);

// Lấy users đã xóa
router.get(
  '/users/deleted',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getDeletedUsers
);

// Lấy user theo ID
router.get(
  '/users/:id',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.params, 'params'),
  adminController.getUserById
);

// Cập nhật user
router.put(
  '/users/:id',
  uploadMiddleware.single('avatar'),
  requirePermission(PERMISSIONS['USER_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.updateUser, 'body'),
  adminController.updateUser
);

// Cập nhật role
router.patch(
  '/users/:id/role',
  requirePermission(PERMISSIONS['USER_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.updateRole, 'body'),
  adminController.updateUserRole
);

// Vô hiệu hóa user
router.patch(
  '/users/:id/disable',
  requirePermission(PERMISSIONS['USER_DISABLE']),
  validate(adminValidation.params, 'params'),
  adminController.disableUser
);

// Kích hoạt user
router.patch(
  '/users/:id/enable',
  requirePermission(PERMISSIONS['USER_ENABLE']),
  validate(adminValidation.params, 'params'),
  adminController.enableUser
);

// Khôi phục user
router.post(
  '/users/:id/restore',
  requirePermission(PERMISSIONS['USER_RESTORE']),
  validate(adminValidation.params, 'params'),
  adminController.restoreUser
);

// Xóa user
router.delete(
  '/users/:id',
  requirePermission(PERMISSIONS['USER_DELETE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteUser
);

// Tìm kiếm users
router.get(
  '/users/search',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.search, 'query'),
  adminController.searchUsers
);

// Users theo role
router.get(
  '/users/by-role',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.byRole, 'query'),
  adminController.getUsersByRole
);

// Users theo department
router.get(
  '/users/by-department',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.byDepartment, 'query'),
  adminController.getUsersByDepartment
);

// Lấy danh sách departments
router.get(
  '/departments',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getDepartments
);

// Lấy department theo ID
router.get(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.params, 'params'),
  adminController.getDepartmentById
);

// Tạo department
router.post(
  '/departments',
  requirePermission(PERMISSIONS['DEPARTMENT_CREATE']),
  validate(adminValidation.departmentBody, 'body'),
  adminController.createDepartment
);

// Cập nhật department
router.put(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.departmentBody, 'body'),
  adminController.updateDepartment
);

// Xóa department
router.delete(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_DELETE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteDepartment
);

// Users trong department
router.get(
  '/departments/:departmentId/users',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getUsersInDepartment
);

// Gán trưởng khoa
router.post(
  '/departments/:departmentId/head',
  requirePermission(PERMISSIONS['DEPARTMENT_UPDATE']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.assignHead, 'body'),
  adminController.assignHeadToDepartment
);

// Thống kê department
router.get(
  '/departments/:departmentId/stats',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  adminController.getDepartmentStats
);

// Lịch hẹn department
router.get(
  '/departments/:departmentId/appointments',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentAppointments
);

// Doanh thu department
router.get(
  '/departments/:departmentId/revenue',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentRevenue
);

// Lịch làm việc department
router.get(
  '/departments/:departmentId/schedule',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentSchedule
);

// Báo cáo patient census
router.get(
  '/reports/clinical/patient-census',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getPatientCensusReport
);

// Báo cáo diagnosis statistics
router.get(
  '/reports/clinical/diagnosis-stats',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDiagnosisStatistics
);

// Báo cáo disease trend
router.get(
  '/reports/clinical/disease-trend',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDiseaseTrendReport
);

// Báo cáo readmission
router.get(
  '/reports/clinical/readmission',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getReadmissionReport
);

// Báo cáo treatment outcome
router.get(
  '/reports/clinical/treatment-outcomes',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getTreatmentOutcomeReport
);

// Báo cáo revenue
router.get(
  '/reports/financial/revenue',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueReport
);

// Báo cáo revenue by department
router.get(
  '/reports/financial/by-department',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueByDepartment
);

// Báo cáo revenue by doctor
router.get(
  '/reports/financial/by-doctor',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueByDoctor
);

// Báo cáo AR aging
router.get(
  '/reports/financial/ar-aging',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getARAgingReport
);

// Báo cáo insurance claim
router.get(
  '/reports/financial/insurance-claims',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getInsuranceClaimReport
);

// Báo cáo outstanding bills
router.get(
  '/reports/financial/outstanding',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getOutstandingBillsReport
);

// Báo cáo medication usage
router.get(
  '/reports/pharmacy/medication-usage',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getMedicationUsageReport
);

// Báo cáo top prescribed
router.get(
  '/reports/pharmacy/top-prescribed',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getTopPrescribedMedications
);

// Báo cáo inventory value
router.get(
  '/reports/pharmacy/inventory-value',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getInventoryValueReport
);

// Báo cáo stock movement
router.get(
  '/reports/pharmacy/stock-movement',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStockMovementReport
);

// Báo cáo expiring medication
router.get(
  '/reports/pharmacy/expiring',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getExpiringMedicationReport
);

// Báo cáo staff attendance
router.get(
  '/reports/hr/attendance',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStaffAttendanceReport
);

// Báo cáo doctor workload
router.get(
  '/reports/hr/doctor-workload',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDoctorWorkloadReport
);

// Báo cáo staff performance
router.get(
  '/reports/hr/performance',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStaffPerformanceReport
);

// Báo cáo user activity
router.get(
  '/reports/system/user-activity',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getUserActivityReport
);

// Báo cáo audit log
router.get(
  '/reports/system/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getAuditLogReport
);

// Báo cáo login history
router.get(
  '/reports/system/login-history',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getLoginHistoryReport
);

// Xuất báo cáo PDF
router.get(
  '/reports/:type/export/pdf',
  requirePermission(PERMISSIONS['REPORT_EXPORT']),
  validate(adminValidation.typeParams, 'params'),
  validate(adminValidation.reportQuery, 'query'),
  adminController.exportReportToPDF
);

// Xuất báo cáo Excel
router.get(
  '/reports/:type/export/excel',
  requirePermission(PERMISSIONS['REPORT_EXPORT']),
  validate(adminValidation.typeParams, 'params'),
  validate(adminValidation.reportQuery, 'query'),
  adminController.exportReportToExcel
);

// Lấy template báo cáo
router.get(
  '/reports/templates',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  adminController.getReportTemplates
);

// Lưu template
router.post(
  '/reports/templates',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.templateBody, 'body'),
  adminController.saveReportTemplate
);

// Cập nhật template
router.put(
  '/reports/templates/:id',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.templateBody, 'body'),
  adminController.updateReportTemplate
);

// Xóa template
router.delete(
  '/reports/templates/:id',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteReportTemplate
);

// Thực thi custom report
router.post(
  '/reports/custom/:templateId/run',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.customReportBody, 'body'),
  adminController.executeCustomReport
);

// Lấy audit logs hệ thống
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.auditQuery, 'query'),
  adminController.getSystemAuditLogs
);

// Lấy audit logs của user
router.get(
  '/audit-logs/user/:userId',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.userParams, 'params'),
  validate(adminValidation.auditQuery, 'query'),
  adminController.getUserAuditLogs
);

// Lấy config hệ thống
router.get(
  '/config',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  adminController.getSystemConfig
);

// Cập nhật config
router.put(
  '/config',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  validate(adminValidation.configBody, 'body'),
  adminController.updateSystemConfig
);

// Lấy hospital info
router.get(
  '/hospital-info',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  adminController.getHospitalInfo
);

// Cập nhật hospital info
router.put(
  '/hospital-info',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  validate(adminValidation.hospitalBody, 'body'),
  adminController.updateHospitalInfo
);

// Trigger backup
router.post(
  '/backup',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  adminController.triggerBackup
);

// Lấy list backup
router.get(
  '/backups',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  adminController.getBackupList
);

// Restore backup
router.post(
  '/restore/:backupId',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  validate(adminValidation.params, 'params'),
  adminController.restoreBackup
);

module.exports = router;