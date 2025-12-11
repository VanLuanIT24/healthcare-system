// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

/**
 * 🎯 ADMIN DASHBOARD ROUTES
 * Các endpoints cho admin dashboard
 */

// Middleware: Tất cả route admin phải authenticate và có role admin
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD'));

/**
 * Dashboard Statistics
 */
// GET /api/admin/dashboard/stats - Thống kê tổng quan
router.get('/dashboard/stats', adminController.getDashboardStats);

// GET /api/admin/dashboard/revenue-chart - Biểu đồ doanh thu 7 ngày
router.get('/dashboard/revenue-chart', adminController.getRevenueChart);

// GET /api/admin/dashboard/department-stats - Thống kê theo khoa
router.get('/dashboard/department-stats', adminController.getDepartmentStats);

// GET /api/admin/dashboard/departments - Alias for department-stats
router.get('/dashboard/departments', adminController.getDepartmentStats);

// GET /api/admin/dashboard/patient-distribution - Phân bố bệnh nhân
router.get('/dashboard/patient-distribution', adminController.getPatientDistribution);

// GET /api/admin/dashboard/recent-activities - Hoạt động gần đây
router.get('/dashboard/recent-activities', adminController.getRecentActivities);

/**
 * System Health
 */
// GET /api/admin/system-health - Kiểm tra sức khỏe hệ thống
router.get('/system-health', adminController.getSystemHealth);

// GET /api/admin/system/health - Alias for system-health
router.get('/system/health', adminController.getSystemHealth);

module.exports = router;
