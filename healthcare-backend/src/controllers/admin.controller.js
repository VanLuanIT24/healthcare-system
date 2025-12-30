// controllers/admin.controller.js
const adminService = require('../services/admin.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class AdminController {
  // Lấy danh sách users
  getUsers = asyncHandler(async (req, res) => {
    const params = req.query;
    const users = await adminService.getUsers(params);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_VIEW,
      user: req.user,
      metadata: { type: 'list' }
    });
    res.json({
      success: true,
      data: users
    });
  });

  // Lấy users đã xóa
  getDeletedUsers = asyncHandler(async (req, res) => {
    const params = req.query;
    const users = await adminService.getDeletedUsers(params);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_VIEW,
      user: req.user,
      metadata: { type: 'deleted' }
    });
    res.json({
      success: true,
      data: users
    });
  });

  // Lấy user theo ID
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_VIEW,
      user: req.user,
      metadata: { userId: id }
    });
    res.json({
      success: true,
      data: user
    });
  });

  // Tạo user mới
  createUser = asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user._id;
    const user = await adminService.createUser(data, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_CREATE,
      user: req.user,
      metadata: { newUserId: user._id, role: user.role }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: user
    });
  });

  // Cập nhật user
  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedBy = req.user._id;
    
    // Add file name to data if file uploaded
    if (req.file) {
      data.avatar = req.file.filename; // Will be saved as personalInfo.profilePicture
      data.profilePicture = req.file.filename;
    }
    
    const user = await adminService.updateUser(id, data, updatedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_UPDATE,
      user: req.user,
      metadata: { userId: id, hasAvatar: !!req.file }
    });
    res.json({
      success: true,
      message: 'Cập nhật user thành công',
      data: user
    });
  });

  // Cập nhật role
  updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const updatedBy = req.user._id;
    const user = await adminService.updateUserRole(id, role, updatedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_UPDATE,
      user: req.user,
      metadata: { userId: id, role }
    });
    res.json({
      success: true,
      message: 'Cập nhật role thành công',
      data: user
    });
  });

  // Vô hiệu hóa user
  disableUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const disabledBy = req.user._id;
    await adminService.disableUser(id, disabledBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_DISABLE,
      user: req.user,
      metadata: { userId: id }
    });
    res.json({
      success: true,
      message: 'Vô hiệu hóa user thành công'
    });
  });

  // Kích hoạt user
  enableUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const enabledBy = req.user._id;
    await adminService.enableUser(id, enabledBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_ENABLE,
      user: req.user,
      metadata: { userId: id }
    });
    res.json({
      success: true,
      message: 'Kích hoạt user thành công'
    });
  });

  // Khôi phục user
  restoreUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const restoredBy = req.user._id;
    const user = await adminService.restoreUser(id, restoredBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_RESTORE,
      user: req.user,
      metadata: { userId: id }
    });
    res.json({
      success: true,
      message: 'Khôi phục user thành công',
      data: user
    });
  });

  // Xóa user vĩnh viễn
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user._id;
    await adminService.deleteUser(id, deletedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.USER_DELETE,
      user: req.user,
      metadata: { userId: id }
    });
    res.json({
      success: true,
      message: 'Xóa user thành công'
    });
  });

  // Tìm kiếm users
  searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const params = req.query;
    const users = await adminService.searchUsers(q, params);
    res.json({
      success: true,
      data: users
    });
  });

  // Users theo role
  getUsersByRole = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const params = req.query;
    const users = await adminService.getUsersByRole(role, params);
    res.json({
      success: true,
      data: users
    });
  });

  // Users theo department
  getUsersByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const params = req.query;
    const users = await adminService.getUsersByDepartment(departmentId, params);
    res.json({
      success: true,
      data: users
    });
  });

  // Thống kê users
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getUserStats();
    res.json({
      success: true,
      data: stats
    });
  });

  // Lấy danh sách departments
  getDepartments = asyncHandler(async (req, res) => {
    const params = req.query;
    const { departments, total, page, limit } = await adminService.getDepartments(params);
    res.json({
      success: true,
      data: departments,
      currentPage: page,
      pageSize: limit,
      total: total
    });
  });

  // Lấy department theo ID
  getDepartmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const department = await adminService.getDepartmentById(id);
    res.json({
      success: true,
      data: department
    });
  });

  // Tạo department mới
  createDepartment = asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user._id;
    const department = await adminService.createDepartment(data, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.DEPARTMENT_CREATE,
      user: req.user,
      metadata: { departmentId: department._id }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo khoa thành công',
      data: department
    });
  });

  // Cập nhật department
  updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedBy = req.user._id;
    const department = await adminService.updateDepartment(id, data, updatedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.DEPARTMENT_UPDATE,
      user: req.user,
      metadata: { departmentId: id }
    });
    res.json({
      success: true,
      message: 'Cập nhật khoa thành công',
      data: department
    });
  });

  // Xóa department
  deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user._id;
    await adminService.deleteDepartment(id, deletedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.DEPARTMENT_DELETE,
      user: req.user,
      metadata: { departmentId: id }
    });
    res.json({
      success: true,
      message: 'Xóa khoa thành công'
    });
  });

  // Users trong department
  getUsersInDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const params = req.query;
    const users = await adminService.getUsersInDepartment(departmentId, params);
    res.json({
      success: true,
      data: users
    });
  });

  // Gán trưởng khoa
  assignHeadToDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const { userId } = req.body;
    const assignedBy = req.user._id;
    const department = await adminService.assignHeadToDepartment(departmentId, userId, assignedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.DEPARTMENT_UPDATE,
      user: req.user,
      metadata: { departmentId, headId: userId }
    });
    res.json({
      success: true,
      message: 'Gán trưởng khoa thành công',
      data: department
    });
  });

  // Thống kê department
  getDepartmentStats = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const params = req.query;
    const stats = await adminService.getDepartmentStats(departmentId, params);
    res.json({
      success: true,
      data: stats
    });
  });

  // Lịch hẹn department
  getDepartmentAppointments = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const params = req.query;
    const appointments = await adminService.getDepartmentAppointments(departmentId, params);
    res.json({
      success: true,
      data: appointments
    });
  });

  // Doanh thu department
  getDepartmentRevenue = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const params = req.query;
    const revenue = await adminService.getDepartmentRevenue(departmentId, params);
    res.json({
      success: true,
      data: revenue
    });
  });

  // Lịch làm việc department
  getDepartmentSchedule = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const params = req.query;
    const schedule = await adminService.getDepartmentSchedule(departmentId, params);
    res.json({
      success: true,
      data: schedule
    });
  });

  // Báo cáo patient census
  getPatientCensusReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getPatientCensusReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo diagnosis statistics
  getDiagnosisStatistics = asyncHandler(async (req, res) => {
    const params = req.query;
    const stats = await adminService.getDiagnosisStatistics(params);
    res.json({
      success: true,
      data: stats
    });
  });

  // Báo cáo disease trend
  getDiseaseTrendReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getDiseaseTrendReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo readmission
  getReadmissionReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getReadmissionReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo treatment outcome
  getTreatmentOutcomeReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getTreatmentOutcomeReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo revenue
  getRevenueReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getRevenueReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo revenue by department
  getRevenueByDepartment = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getRevenueByDepartment(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo revenue by doctor
  getRevenueByDoctor = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getRevenueByDoctor(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo AR aging
  getARAgingReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getARAgingReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo insurance claim
  getInsuranceClaimReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getInsuranceClaimReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo outstanding bills
  getOutstandingBillsReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getOutstandingBillsReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo medication usage
  getMedicationUsageReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getMedicationUsageReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo top prescribed medications
  getTopPrescribedMedications = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getTopPrescribedMedications(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo inventory value
  getInventoryValueReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getInventoryValueReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo stock movement
  getStockMovementReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getStockMovementReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo expiring medication
  getExpiringMedicationReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getExpiringMedicationReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo staff attendance
  getStaffAttendanceReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getStaffAttendanceReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo doctor workload
  getDoctorWorkloadReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getDoctorWorkloadReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo staff performance
  getStaffPerformanceReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getStaffPerformanceReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo user activity
  getUserActivityReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getUserActivityReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo audit log
  getAuditLogReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getAuditLogReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Báo cáo login history
  getLoginHistoryReport = asyncHandler(async (req, res) => {
    const params = req.query;
    const report = await adminService.getLoginHistoryReport(params);
    res.json({
      success: true,
      data: report
    });
  });

  // Xuất báo cáo PDF
  exportReportToPDF = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const params = req.query;
    const pdf = await adminService.exportReportToPDF(type, params);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
    res.send(pdf);
  });

  // Xuất báo cáo Excel
  exportReportToExcel = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const params = req.query;
    const excel = await adminService.exportReportToExcel(type, params);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
    res.send(excel);
  });

  // Lấy template báo cáo
  getReportTemplates = asyncHandler(async (req, res) => {
    const templates = await adminService.getReportTemplates();
    res.json({
      success: true,
      data: templates
    });
  });

  // Lưu template báo cáo
  saveReportTemplate = asyncHandler(async (req, res) => {
    const data = req.body;
    const template = await adminService.saveReportTemplate(data);
    res.status(201).json({
      success: true,
      message: 'Lưu template thành công',
      data: template
    });
  });

  // Cập nhật template
  updateReportTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const template = await adminService.updateReportTemplate(id, data);
    res.json({
      success: true,
      message: 'Cập nhật template thành công',
      data: template
    });
  });

  // Xóa template
  deleteReportTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await adminService.deleteReportTemplate(id);
    res.json({
      success: true,
      message: 'Xóa template thành công'
    });
  });

  // Thực thi báo cáo tùy chỉnh
  executeCustomReport = asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const params = req.body;
    const report = await adminService.executeCustomReport(templateId, params);
    res.json({
      success: true,
      data: report
    });
  });

  // Lấy audit logs hệ thống
  getSystemAuditLogs = asyncHandler(async (req, res) => {
    const params = req.query;
    const logs = await adminService.getSystemAuditLogs(params);
    res.json({
      success: true,
      data: logs
    });
  });

  // Lấy audit logs của user
  getUserAuditLogs = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const params = req.query;
    const logs = await adminService.getUserAuditLogs(userId, params);
    res.json({
      success: true,
      data: logs
    });
  });

  // Lấy config hệ thống
  getSystemConfig = asyncHandler(async (req, res) => {
    const config = await adminService.getSystemConfig();
    res.json({
      success: true,
      data: config
    });
  });

  // Cập nhật config
  updateSystemConfig = asyncHandler(async (req, res) => {
    const data = req.body;
    const config = await adminService.updateSystemConfig(data);
    await manualAuditLog({
      action: AUDIT_ACTIONS.SYSTEM_CONFIG,
      user: req.user,
      metadata: { updates: Object.keys(data) }
    });
    res.json({
      success: true,
      message: 'Cập nhật config thành công',
      data: config
    });
  });

  // Lấy info bệnh viện
  getHospitalInfo = asyncHandler(async (req, res) => {
    const info = await adminService.getHospitalInfo();
    res.json({
      success: true,
      data: info
    });
  });

  // Cập nhật info bệnh viện
  updateHospitalInfo = asyncHandler(async (req, res) => {
    const data = req.body;
    const info = await adminService.updateHospitalInfo(data);
    await manualAuditLog({
      action: AUDIT_ACTIONS.SYSTEM_CONFIG,
      user: req.user,
      metadata: { type: 'hospital_info' }
    });
    res.json({
      success: true,
      message: 'Cập nhật thông tin bệnh viện thành công',
      data: info
    });
  });

  // Trigger backup
  triggerBackup = asyncHandler(async (req, res) => {
    const backup = await adminService.triggerBackup(req.user._id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.SYSTEM_BACKUP_DATA,
      user: req.user,
      metadata: { backupId: backup.id }
    });
    res.json({
      success: true,
      message: 'Tạo backup thành công',
      data: backup
    });
  });

  // Lấy list backup
  getBackupList = asyncHandler(async (req, res) => {
    const backups = await adminService.getBackupList();
    res.json({
      success: true,
      data: backups
    });
  });

  // Restore backup
  restoreBackup = asyncHandler(async (req, res) => {
    const { backupId } = req.params;
    const result = await adminService.restoreBackup(backupId, req.user._id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.SYSTEM_BACKUP_DATA,
      user: req.user,
      metadata: { backupId, action: 'restore' }
    });
    res.json({
      success: true,
      message: 'Khôi phục dữ liệu thành công',
      data: result
    });
  });
}

module.exports = new AdminController();