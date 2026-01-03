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

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
// Lấy danh sách bác sĩ - Sử dụng DoctorController để lấy đầy đủ dữ liệu
const doctorController = require('../controllers/doctor.controller');
router.get(
  '/doctors',
  doctorController.getDoctors
);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Tạo người dùng mới
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 */
// ✅ POST /users route
router.post(
  '/users',
  requirePermission(PERMISSIONS['USER_CREATE']),
  validate(adminValidation.createUser, 'body'),
  adminController.createUser
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
// Lấy danh sách users
router.get(
  '/users',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getUsers
);

/**
 * @swagger
 * /api/admin/users/deleted:
 *   get:
 *     summary: Lấy danh sách người dùng đã xóa
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng đã xóa
 */
// Lấy users đã xóa
router.get(
  '/users/deleted',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getDeletedUsers
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// Lấy user theo ID
router.get(
  '/users/:id',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.params, 'params'),
  adminController.getUserById
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật user
router.put(
  '/users/:id',
  uploadMiddleware.single('avatar'),
  requirePermission(PERMISSIONS['USER_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.updateUser, 'body'),
  adminController.updateUser
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Cập nhật vai trò người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật vai trò thành công
 */
// Cập nhật role
router.patch(
  '/users/:id/role',
  requirePermission(PERMISSIONS['USER_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.updateRole, 'body'),
  adminController.updateUserRole
);

/**
 * @swagger
 * /api/admin/users/{id}/disable:
 *   patch:
 *     summary: Vô hiệu hóa người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vô hiệu hóa thành công
 */
// Vô hiệu hóa user
router.patch(
  '/users/:id/disable',
  requirePermission(PERMISSIONS['USER_DISABLE']),
  validate(adminValidation.params, 'params'),
  adminController.disableUser
);

/**
 * @swagger
 * /api/admin/users/{id}/enable:
 *   patch:
 *     summary: Kích hoạt người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kích hoạt thành công
 */
// Kích hoạt user
router.patch(
  '/users/:id/enable',
  requirePermission(PERMISSIONS['USER_ENABLE']),
  validate(adminValidation.params, 'params'),
  adminController.enableUser
);

/**
 * @swagger
 * /api/admin/users/{id}/restore:
 *   post:
 *     summary: Khôi phục người dùng đã xóa
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Khôi phục thành công
 */
// Khôi phục user
router.post(
  '/users/:id/restore',
  requirePermission(PERMISSIONS['USER_RESTORE']),
  validate(adminValidation.params, 'params'),
  adminController.restoreUser
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
// Xóa user
router.delete(
  '/users/:id',
  requirePermission(PERMISSIONS['USER_DELETE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteUser
);

/**
 * @swagger
 * /api/admin/users/search:
 *   get:
 *     summary: Tìm kiếm người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 */
// Tìm kiếm users
router.get(
  '/users/search',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.search, 'query'),
  adminController.searchUsers
);

/**
 * @swagger
 * /api/admin/users/by-role:
 *   get:
 *     summary: Lấy người dùng theo vai trò
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách người dùng theo vai trò
 */
// Users theo role
router.get(
  '/users/by-role',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.byRole, 'query'),
  adminController.getUsersByRole
);

/**
 * @swagger
 * /api/admin/users/by-department:
 *   get:
 *     summary: Lấy người dùng theo phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách người dùng theo phòng ban
 */
// Users theo department
router.get(
  '/users/by-department',
  requirePermission(PERMISSIONS['USER_VIEW']),
  validate(adminValidation.byDepartment, 'query'),
  adminController.getUsersByDepartment
);

/**
 * @swagger
 * /api/admin/departments:
 *   get:
 *     summary: Lấy danh sách phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phòng ban
 */
// Lấy danh sách departments
router.get(
  '/departments',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.query, 'query'),
  adminController.getDepartments
);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   get:
 *     summary: Lấy thông tin phòng ban theo ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin phòng ban
 */
// Lấy department theo ID
router.get(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.params, 'params'),
  adminController.getDepartmentById
);

/**
 * @swagger
 * /api/admin/departments:
 *   post:
 *     summary: Tạo phòng ban mới
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo phòng ban thành công
 */
// Tạo department
router.post(
  '/departments',
  requirePermission(PERMISSIONS['DEPARTMENT_CREATE']),
  validate(adminValidation.departmentBody, 'body'),
  adminController.createDepartment
);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   put:
 *     summary: Cập nhật phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật department
router.put(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_UPDATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.departmentBody, 'body'),
  adminController.updateDepartment
);

/**
 * @swagger
 * /api/admin/departments/{id}:
 *   delete:
 *     summary: Xóa phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
// Xóa department
router.delete(
  '/departments/:id',
  requirePermission(PERMISSIONS['DEPARTMENT_DELETE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteDepartment
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/users:
 *   get:
 *     summary: Lấy người dùng trong phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
// Users trong department
router.get(
  '/departments/:departmentId/users',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getUsersInDepartment
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/head:
 *   post:
 *     summary: Gán trưởng khoa cho phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gán thành công
 */
// Gán trưởng khoa
router.post(
  '/departments/:departmentId/head',
  requirePermission(PERMISSIONS['DEPARTMENT_UPDATE']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.assignHead, 'body'),
  adminController.assignHeadToDepartment
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/stats:
 *   get:
 *     summary: Lấy thống kê phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thống kê phòng ban
 */
// Thống kê department
router.get(
  '/departments/:departmentId/stats',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  adminController.getDepartmentStats
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/appointments:
 *   get:
 *     summary: Lấy lịch hẹn của phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
// Lịch hẹn department
router.get(
  '/departments/:departmentId/appointments',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentAppointments
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/revenue:
 *   get:
 *     summary: Lấy doanh thu phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doanh thu phòng ban
 */
// Doanh thu department
router.get(
  '/departments/:departmentId/revenue',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentRevenue
);

/**
 * @swagger
 * /api/admin/departments/{departmentId}/schedule:
 *   get:
 *     summary: Lấy lịch làm việc phòng ban
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lịch làm việc phòng ban
 */
// Lịch làm việc department
router.get(
  '/departments/:departmentId/schedule',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  validate(adminValidation.departmentParams, 'params'),
  validate(adminValidation.query, 'query'),
  adminController.getDepartmentSchedule
);

// ===== BÁO CÁO LÂM SÀNG =====

/**
 * @swagger
 * /api/admin/reports/clinical/patient-census:
 *   get:
 *     summary: Báo cáo thống kê bệnh nhân
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Báo cáo thống kê
 */
// Báo cáo patient census
router.get(
  '/reports/clinical/patient-census',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getPatientCensusReport
);

/**
 * @swagger
 * /api/admin/reports/clinical/diagnosis-stats:
 *   get:
 *     summary: Thống kê chẩn đoán
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê chẩn đoán
 */
// Báo cáo diagnosis statistics
router.get(
  '/reports/clinical/diagnosis-stats',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDiagnosisStatistics
);

/**
 * @swagger
 * /api/admin/reports/clinical/disease-trend:
 *   get:
 *     summary: Xu hướng bệnh tật
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xu hướng bệnh tật
 */
// Báo cáo disease trend
router.get(
  '/reports/clinical/disease-trend',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDiseaseTrendReport
);

/**
 * @swagger
 * /api/admin/reports/clinical/readmission:
 *   get:
 *     summary: Báo cáo tái nhập viện
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo tái nhập viện
 */
// Báo cáo readmission
router.get(
  '/reports/clinical/readmission',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getReadmissionReport
);

/**
 * @swagger
 * /api/admin/reports/clinical/treatment-outcomes:
 *   get:
 *     summary: Kết quả điều trị
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kết quả điều trị
 */
// Báo cáo treatment outcome
router.get(
  '/reports/clinical/treatment-outcomes',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getTreatmentOutcomeReport
);

// ===== BÁO CÁO TÀI CHÍNH =====

/**
 * @swagger
 * /api/admin/reports/financial/revenue:
 *   get:
 *     summary: Báo cáo doanh thu
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo doanh thu
 */
// Báo cáo revenue
router.get(
  '/reports/financial/revenue',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueReport
);

/**
 * @swagger
 * /api/admin/reports/financial/by-department:
 *   get:
 *     summary: Doanh thu theo phòng ban
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doanh thu theo phòng ban
 */
// Báo cáo revenue by department
router.get(
  '/reports/financial/by-department',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueByDepartment
);

/**
 * @swagger
 * /api/admin/reports/financial/by-doctor:
 *   get:
 *     summary: Doanh thu theo bác sĩ
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doanh thu theo bác sĩ
 */
// Báo cáo revenue by doctor
router.get(
  '/reports/financial/by-doctor',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getRevenueByDoctor
);

/**
 * @swagger
 * /api/admin/reports/financial/ar-aging:
 *   get:
 *     summary: Báo cáo phải thu theo tuổi nợ
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo AR aging
 */
// Báo cáo AR aging
router.get(
  '/reports/financial/ar-aging',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getARAgingReport
);

/**
 * @swagger
 * /api/admin/reports/financial/insurance-claims:
 *   get:
 *     summary: Báo cáo claim bảo hiểm
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo bảo hiểm
 */
// Báo cáo insurance claim
router.get(
  '/reports/financial/insurance-claims',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getInsuranceClaimReport
);

/**
 * @swagger
 * /api/admin/reports/financial/outstanding:
 *   get:
 *     summary: Báo cáo hóa đơn chưa thanh toán
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hóa đơn chưa thanh toán
 */
// Báo cáo outstanding bills
router.get(
  '/reports/financial/outstanding',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getOutstandingBillsReport
);

// ===== BÁO CÁO DƯỢC =====

/**
 * @swagger
 * /api/admin/reports/pharmacy/medication-usage:
 *   get:
 *     summary: Báo cáo sử dụng thuốc
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo sử dụng thuốc
 */
// Báo cáo medication usage
router.get(
  '/reports/pharmacy/medication-usage',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getMedicationUsageReport
);

/**
 * @swagger
 * /api/admin/reports/pharmacy/top-prescribed:
 *   get:
 *     summary: Thuốc được kê nhiều nhất
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top thuốc được kê
 */
// Báo cáo top prescribed
router.get(
  '/reports/pharmacy/top-prescribed',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getTopPrescribedMedications
);

/**
 * @swagger
 * /api/admin/reports/pharmacy/inventory-value:
 *   get:
 *     summary: Giá trị tồn kho thuốc
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Giá trị tồn kho
 */
// Báo cáo inventory value
router.get(
  '/reports/pharmacy/inventory-value',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getInventoryValueReport
);

/**
 * @swagger
 * /api/admin/reports/pharmacy/stock-movement:
 *   get:
 *     summary: Biến động tồn kho
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Biến động tồn kho
 */
// Báo cáo stock movement
router.get(
  '/reports/pharmacy/stock-movement',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStockMovementReport
);

/**
 * @swagger
 * /api/admin/reports/pharmacy/expiring:
 *   get:
 *     summary: Thuốc sắp hết hạn
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thuốc sắp hết hạn
 */
// Báo cáo expiring medication
router.get(
  '/reports/pharmacy/expiring',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getExpiringMedicationReport
);

// ===== BÁO CÁO NHÂN SỰ =====

/**
 * @swagger
 * /api/admin/reports/hr/attendance:
 *   get:
 *     summary: Báo cáo chấm công
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo chấm công
 */
// Báo cáo staff attendance
router.get(
  '/reports/hr/attendance',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStaffAttendanceReport
);

/**
 * @swagger
 * /api/admin/reports/hr/doctor-workload:
 *   get:
 *     summary: Khối lượng công việc bác sĩ
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Khối lượng công việc
 */
// Báo cáo doctor workload
router.get(
  '/reports/hr/doctor-workload',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getDoctorWorkloadReport
);

/**
 * @swagger
 * /api/admin/reports/hr/performance:
 *   get:
 *     summary: Hiệu suất nhân viên
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hiệu suất nhân viên
 */
// Báo cáo staff performance
router.get(
  '/reports/hr/performance',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getStaffPerformanceReport
);

// ===== BÁO CÁO HỆ THỐNG =====

/**
 * @swagger
 * /api/admin/reports/system/user-activity:
 *   get:
 *     summary: Hoạt động người dùng
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hoạt động người dùng
 */
// Báo cáo user activity
router.get(
  '/reports/system/user-activity',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getUserActivityReport
);

/**
 * @swagger
 * /api/admin/reports/system/audit-logs:
 *   get:
 *     summary: Nhật ký audit
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nhật ký audit
 */
// Báo cáo audit log
router.get(
  '/reports/system/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getAuditLogReport
);

/**
 * @swagger
 * /api/admin/reports/system/login-history:
 *   get:
 *     summary: Lịch sử đăng nhập
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử đăng nhập
 */
// Báo cáo login history
router.get(
  '/reports/system/login-history',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.reportQuery, 'query'),
  adminController.getLoginHistoryReport
);

// ===== XUẤT BÁO CÁO =====

/**
 * @swagger
 * /api/admin/reports/{type}/export/pdf:
 *   get:
 *     summary: Xuất báo cáo PDF
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
// Xuất báo cáo PDF
router.get(
  '/reports/:type/export/pdf',
  requirePermission(PERMISSIONS['REPORT_EXPORT']),
  validate(adminValidation.typeParams, 'params'),
  validate(adminValidation.reportQuery, 'query'),
  adminController.exportReportToPDF
);

/**
 * @swagger
 * /api/admin/reports/{type}/export/excel:
 *   get:
 *     summary: Xuất báo cáo Excel
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
// Xuất báo cáo Excel
router.get(
  '/reports/:type/export/excel',
  requirePermission(PERMISSIONS['REPORT_EXPORT']),
  validate(adminValidation.typeParams, 'params'),
  validate(adminValidation.reportQuery, 'query'),
  adminController.exportReportToExcel
);

// ===== TEMPLATE BÁO CÁO =====

/**
 * @swagger
 * /api/admin/reports/templates:
 *   get:
 *     summary: Lấy danh sách template báo cáo
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách template
 */
// Lấy template báo cáo
router.get(
  '/reports/templates',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  adminController.getReportTemplates
);

/**
 * @swagger
 * /api/admin/reports/templates:
 *   post:
 *     summary: Lưu template báo cáo
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Lưu thành công
 */
// Lưu template
router.post(
  '/reports/templates',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.templateBody, 'body'),
  adminController.saveReportTemplate
);

/**
 * @swagger
 * /api/admin/reports/templates/{id}:
 *   put:
 *     summary: Cập nhật template
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật template
router.put(
  '/reports/templates/:id',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.templateBody, 'body'),
  adminController.updateReportTemplate
);

/**
 * @swagger
 * /api/admin/reports/templates/{id}:
 *   delete:
 *     summary: Xóa template
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
// Xóa template
router.delete(
  '/reports/templates/:id',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  adminController.deleteReportTemplate
);

/**
 * @swagger
 * /api/admin/reports/custom/{templateId}/run:
 *   post:
 *     summary: Thực thi báo cáo tùy chỉnh
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kết quả báo cáo
 */
// Thực thi custom report
router.post(
  '/reports/custom/:templateId/run',
  requirePermission(PERMISSIONS['REPORT_GENERATE']),
  validate(adminValidation.params, 'params'),
  validate(adminValidation.customReportBody, 'body'),
  adminController.executeCustomReport
);

// ===== AUDIT LOGS & CẤU HÌNH =====

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Lấy nhật ký audit hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nhật ký audit
 */
// Lấy audit logs hệ thống
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.auditQuery, 'query'),
  adminController.getSystemAuditLogs
);

/**
 * @swagger
 * /api/admin/audit-logs/user/{userId}:
 *   get:
 *     summary: Lấy nhật ký audit của người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nhật ký audit của user
 */
// Lấy audit logs của user
router.get(
  '/audit-logs/user/:userId',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(adminValidation.userParams, 'params'),
  validate(adminValidation.auditQuery, 'query'),
  adminController.getUserAuditLogs
);

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     summary: Lấy cấu hình hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cấu hình hệ thống
 */
// Lấy config hệ thống
router.get(
  '/config',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  adminController.getSystemConfig
);

/**
 * @swagger
 * /api/admin/config:
 *   put:
 *     summary: Cập nhật cấu hình hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật config
router.put(
  '/config',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  validate(adminValidation.configBody, 'body'),
  adminController.updateSystemConfig
);

/**
 * @swagger
 * /api/admin/hospital-info:
 *   get:
 *     summary: Lấy thông tin bệnh viện
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin bệnh viện
 */
// Lấy hospital info
router.get(
  '/hospital-info',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  adminController.getHospitalInfo
);

/**
 * @swagger
 * /api/admin/hospital-info:
 *   put:
 *     summary: Cập nhật thông tin bệnh viện
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật hospital info
router.put(
  '/hospital-info',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  validate(adminValidation.hospitalBody, 'body'),
  adminController.updateHospitalInfo
);

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Tạo backup hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo backup thành công
 */
// Trigger backup
router.post(
  '/backup',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  adminController.triggerBackup
);

/**
 * @swagger
 * /api/admin/backups:
 *   get:
 *     summary: Lấy danh sách backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách backup
 */
// Lấy list backup
router.get(
  '/backups',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  adminController.getBackupList
);

/**
 * @swagger
 * /api/admin/restore/{backupId}:
 *   post:
 *     summary: Phục hồi từ backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phục hồi thành công
 */
// Restore backup
router.post(
  '/restore/:backupId',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  validate(adminValidation.params, 'params'),
  adminController.restoreBackup
);

module.exports = router;