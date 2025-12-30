// src/routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants/roles');

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
 * GET /api/admin/doctors
 * Get all doctors with filters and pagination
 */
router.get(
  '/',
  authenticate,
  requireAdminRole,
  doctorController.getDoctors
);

/**
 * GET /api/admin/doctors/stats
 * Get all doctors statistics
 */
router.get(
  '/stats',
  authenticate,
  requireAdminRole,
  doctorController.getAllDoctorsStats
);

/**
 * POST /api/admin/doctors
 * Create new doctor
 */
router.post(
  '/',
  authenticate,
  requireAdminRole,
  doctorController.createDoctor
);

/**
 * GET /api/admin/doctors/:doctorId
 * Get single doctor by ID
 */
router.get(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.getDoctorById
);

/**
 * PUT /api/admin/doctors/:doctorId
 * Update doctor
 */
router.put(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.updateDoctor
);

/**
 * DELETE /api/admin/doctors/:doctorId
 * Delete doctor (soft delete)
 */
router.delete(
  '/:doctorId',
  authenticate,
  requireAdminRole,
  doctorController.deleteDoctor
);

/**
 * PATCH /api/admin/doctors/:doctorId/disable
 * Disable doctor
 */
router.patch(
  '/:doctorId/disable',
  authenticate,
  requireAdminRole,
  doctorController.disableDoctor
);

/**
 * PATCH /api/admin/doctors/:doctorId/enable
 * Enable doctor
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
