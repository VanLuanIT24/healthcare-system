// routes/report.routes.js - Báo cáo & Thống kê
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// ===== BÁOO CÁO LÂM SÀNG =====

/**
 * @swagger
 * /api/reports/clinical:
 *   get:
 *     summary: Lấy báo cáo lâm sàng
 *     tags: [Reports]
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
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Báo cáo lâm sàng
 */
router.get(
  '/clinical',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  reportController.getClinicalReport
);

// ===== BÁOO CÁO TÀI CHÍNH =====

/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     summary: Lấy báo cáo tài chính
 *     tags: [Reports]
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
 *         description: Báo cáo tài chính
 */
router.get(
  '/financial',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  reportController.getFinancialReport
);

// ===== BÁOO CÁO DƯỢC =====

/**
 * @swagger
 * /api/reports/pharmacy:
 *   get:
 *     summary: Lấy báo cáo dược
 *     tags: [Reports]
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
 *         description: Báo cáo dược
 */
router.get(
  '/pharmacy',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  reportController.getPharmacyReport
);

// ===== BÁOO CÁO NHÂN SỰ =====

/**
 * @swagger
 * /api/reports/hr:
 *   get:
 *     summary: Lấy báo cáo nhân sự
 *     tags: [Reports]
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
 *         description: Báo cáo nhân sự
 */
router.get(
  '/hr',
  requirePermission(PERMISSIONS['REPORT_VIEW']),
  reportController.getHRReport
);

module.exports = router;
