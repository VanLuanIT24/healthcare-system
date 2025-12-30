// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Thống kê users
router.get(
  '/users/stats',
  requirePermission(PERMISSIONS['USER.VIEW']),
  dashboardController.getUsersStats
);

// Thống kê appointments
router.get(
  '/appointments/stats',
  requirePermission(PERMISSIONS['APPOINTMENT.VIEW']),
  dashboardController.getAppointmentsStats
);

// Thống kê departments
router.get(
  '/departments/stats',
  requirePermission(PERMISSIONS['DEPARTMENT.VIEW']),
  dashboardController.getDepartmentsStats
);

// Overview reports
router.get(
  '/reports/overview',
  requirePermission(PERMISSIONS['REPORT.VIEW']),
  dashboardController.getReportsOverview
);

// Recent appointments
router.get(
  '/appointments/recent',
  requirePermission(PERMISSIONS['APPOINTMENT.VIEW']),
  dashboardController.getRecentAppointments
);

module.exports = router;
