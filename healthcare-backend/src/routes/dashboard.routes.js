// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/users/stats:
 *   get:
 *     summary: Lấy thống kê người dùng
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê người dùng
 */
// Thống kê users
router.get(
  '/users/stats',
  requirePermission(PERMISSIONS['USER_VIEW']),
  dashboardController.getUsersStats
);

/**
 * @swagger
 * /api/dashboard/appointments/stats:
 *   get:
 *     summary: Lấy thống kê lịch hẹn
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê lịch hẹn
 */
// Thống kê appointments
router.get(
  '/appointments/stats',
  requirePermission(PERMISSIONS['APPOINTMENT_VIEW']),
  dashboardController.getAppointmentsStats
);

/**
 * @swagger
 * /api/dashboard/departments/stats:
 *   get:
 *     summary: Lấy thống kê phòng ban
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê phòng ban
 */
// Thống kê departments
router.get(
  '/departments/stats',
  requirePermission(PERMISSIONS['DEPARTMENT_VIEW']),
  dashboardController.getDepartmentsStats
);

/**
 * @swagger
 * /api/dashboard/reports/overview:
 *   get:
 *     summary: Lấy tổng quan báo cáo
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tổng quan báo cáo
 */
// Overview reports
router.get(
  '/reports/overview',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  dashboardController.getReportsOverview
);

/**
 * @swagger
 * /api/dashboard/appointments/recent:
 *   get:
 *     summary: Lấy lịch hẹn gần đây
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn gần đây
 */
// Recent appointments
router.get(
  '/appointments/recent',
  requirePermission(PERMISSIONS['APPOINTMENT_VIEW']),
  dashboardController.getRecentAppointments
);

module.exports = router;
