// routes/report.routes.js - Báo cáo & Thống kê
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// ===== BÁOO CÁO LÂM SÀNG =====
router.get(
  '/clinical',
  requirePermission(PERMISSIONS['REPORT.VIEW']),
  reportController.getClinicalReport
);

// ===== BÁOO CÁO TÀI CHÍNH =====
router.get(
  '/financial',
  requirePermission(PERMISSIONS['REPORT.VIEW']),
  reportController.getFinancialReport
);

// ===== BÁOO CÁO DƯỢC =====
router.get(
  '/pharmacy',
  requirePermission(PERMISSIONS['REPORT.VIEW']),
  reportController.getPharmacyReport
);

// ===== BÁOO CÁO NHÂN SỰ =====
router.get(
  '/hr',
  requirePermission(PERMISSIONS['REPORT.VIEW']),
  reportController.getHRReport
);

module.exports = router;
