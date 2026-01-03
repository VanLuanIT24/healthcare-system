// src/routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: 👨‍⚕️ Quản lý bác sĩ
 */

/**
 * Doctor Management Routes
 * Base: /api/admin/doctors
 */

// Middleware to check if user has admin role
const requireAdminRole = (req, res, next) => {
  const adminRoles = [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD];
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
};

// ============ ADMIN ONLY ROUTES ============

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ
 *     tags: [Doctors]
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
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Lọc theo chuyên khoa
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo khoa
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái sẵn sàng
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  authenticate,
  requireAdminRole,
  doctorController.getDoctors
);

/**
 * @swagger
 * /api/admin/doctors/stats:
 *   get:
 *     summary: Lấy thống kê bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê bác sĩ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDoctors:
 *                       type: integer
 *                     availableDoctors:
 *                       type: integer
 *                     bySpecialization:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats',
  authenticate,
  requireAdminRole,
  doctorController.getAllDoctorsStats
);

/**
 * @swagger
 * /api/admin/doctors:
 *   post:
 *     summary: Tạo bác sĩ mới
 *     tags: [Doctors]
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
 *               - fullName
 *               - specialization
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *                 example: Nội khoa
 *               department:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               experience:
 *                 type: integer
 *                 example: 5
 *               consultationFee:
 *                 type: number
 *                 example: 300000
 *     responses:
 *       201:
 *         description: Tạo bác sĩ thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authenticate,
  requireAdminRole,
  doctorController.createDoctor
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}:
 *   get:
 *     summary: Lấy thông tin bác sĩ theo ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin bác sĩ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Doctor'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.getDoctorById
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}:
 *   put:
 *     summary: Cập nhật thông tin bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
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
 *               fullName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               department:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.updateDoctor
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}:
 *   delete:
 *     summary: Xóa bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.deleteDoctor
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}/disable:
 *   patch:
 *     summary: Vô hiệu hóa bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vô hiệu hóa thành công
 */
router.patch(
  '/:doctorId/disable',
  authenticate,
  requireAdminRole,
  doctorController.disableDoctor
);

/**
 * @swagger
 * /api/admin/doctors/{doctorId}/enable:
 *   patch:
 *     summary: Kích hoạt bác sĩ
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kích hoạt thành công
 */
router.patch(
  '/:doctorId/enable',
  authenticate,
  requireAdminRole,
  doctorController.enableDoctor
);

/**
 * GET /api/admin/doctors/:doctorId/stats
 * Get single doctor statistics
 */
router.get(
  '/:doctorId/stats',
  authenticate,
  requireAdminRole,
  doctorController.getDoctorStats
);

/**
 * POST /api/admin/doctors/:doctorId/specialties
 * Add specialty to doctor
 */
router.post(
  '/:doctorId/specialties',
  authenticate,
  requireAdminRole,
  doctorController.addSpecialty
);

/**
 * DELETE /api/admin/doctors/:doctorId/specialties/:specialtyId
 * Remove specialty from doctor
 */
router.delete(
  '/:doctorId/specialties/:specialtyId',
  authenticate,
  requireAdminRole,
  doctorController.removeSpecialty
);

// ============ NEW ROUTES FOR ADVANCED FEATURES ============

/**
 * POST /api/admin/doctors/:doctorId/credentials
 * Add credential to doctor
 */
router.post(
  '/:doctorId/credentials',
  authenticate,
  requireAdminRole,
  doctorController.addCredential
);

/**
 * PUT /api/admin/doctors/:doctorId/credentials/:credentialId
 * Update doctor credential
 */
router.put(
  '/:doctorId/credentials/:credentialId',
  authenticate,
  requireAdminRole,
  doctorController.updateCredential
);

/**
 * DELETE /api/admin/doctors/:doctorId/credentials/:credentialId
 * Delete doctor credential
 */
router.delete(
  '/:doctorId/credentials/:credentialId',
  authenticate,
  requireAdminRole,
  doctorController.deleteCredential
);

/**
 * PATCH /api/admin/doctors/:doctorId/fees
 * Set consultation fees for doctor
 */
router.patch(
  '/:doctorId/fees',
  authenticate,
  requireAdminRole,
  doctorController.setConsultationFees
);

/**
 * GET /api/admin/doctors/:doctorId/fees
 * Get consultation fees for doctor
 */
router.get(
  '/:doctorId/fees',
  authenticate,
  requireAdminRole,
  doctorController.getConsultationFees
);

/**
 * POST /api/admin/doctors/:doctorId/reset-password
 * Send password reset email to doctor
 */
router.post(
  '/:doctorId/reset-password',
  authenticate,
  requireAdminRole,
  doctorController.resetPassword
);

/**
 * GET /api/admin/doctors/:doctorId/login-history
 * Get doctor login history
 */
router.get(
  '/:doctorId/login-history',
  authenticate,
  requireAdminRole,
  doctorController.getLoginHistory
);

/**
 * POST /api/admin/doctors/:doctorId/force-logout
 * Force logout doctor from all devices
 */
router.post(
  '/:doctorId/force-logout',
  authenticate,
  requireAdminRole,
  doctorController.forceLogout
);

/**
 * GET /api/admin/doctors/:doctorId/activity-log
 * Get doctor activity log
 */
router.get(
  '/:doctorId/activity-log',
  authenticate,
  requireAdminRole,
  doctorController.getActivityLog
);

/**
 * GET /api/admin/doctors/:doctorId/performance
 * Get doctor performance metrics
 */
router.get(
  '/:doctorId/performance',
  authenticate,
  requireAdminRole,
  doctorController.getPerformanceMetrics
);

/**
 * GET /api/admin/doctors/:doctorId/reviews
 * Get doctor reviews from patients
 */
router.get(
  '/:doctorId/reviews',
  authenticate,
  requireAdminRole,
  doctorController.getDoctorReviews
);

/**
 * GET /api/admin/doctors/:doctorId/patients
 * Get doctor patients list
 */
router.get(
  '/:doctorId/patients',
  authenticate,
  requireAdminRole,
  doctorController.getDoctorPatients
);

/**
 * PATCH /api/admin/doctors/bulk/enable
 * Enable multiple doctors
 */
router.patch(
  '/bulk/enable',
  authenticate,
  requireAdminRole,
  doctorController.bulkEnableDoctors
);

/**
 * PATCH /api/admin/doctors/bulk/disable
 * Disable multiple doctors
 */
router.patch(
  '/bulk/disable',
  authenticate,
  requireAdminRole,
  doctorController.bulkDisableDoctors
);

/**
 * DELETE /api/admin/doctors/bulk/delete
 * Delete multiple doctors
 */
router.delete(
  '/bulk/delete',
  authenticate,
  requireAdminRole,
  doctorController.bulkDeleteDoctors
);

module.exports = router;
