// routes/settings.routes.js - Cài đặt hệ thống
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// ===== CẤUU HÌNH HỆ THỐNG =====

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Lấy cài đặt hệ thống
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cài đặt hệ thống
 */
router.get(
  '/',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  settingsController.getSystemSettings
);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Cập nhật cài đặt hệ thống
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalName:
 *                 type: string
 *               workingHours:
 *                 type: object
 *               appointmentDuration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  '/',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  settingsController.updateSystemSettings
);

// ===== QUẢN LÝ VAI TRÒ & QUYỀN =====

/**
 * @swagger
 * /api/settings/roles:
 *   get:
 *     summary: Lấy danh sách vai trò
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách vai trò và quyền
 */
router.get(
  '/roles',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  settingsController.getRoles
);

/**
 * @swagger
 * /api/settings/roles/{roleId}/permissions:
 *   put:
 *     summary: Cập nhật quyền của vai trò
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  '/roles/:roleId/permissions',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  settingsController.updateRolePermissions
);

// ===== NHẬT KÝ HOẠT ĐỘNG =====

/**
 * @swagger
 * /api/settings/audit-logs:
 *   get:
 *     summary: Lấy nhật ký hoạt động
 *     tags: [Settings]
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
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách nhật ký hoạt động
 */
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  settingsController.getAuditLogs
);

/**
 * @swagger
 * /api/settings/audit-logs/stats:
 *   get:
 *     summary: Lấy thống kê nhật ký hoạt động
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê nhật ký
 */
router.get(
  '/audit-logs/stats',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  settingsController.getAuditLogsStats
);

// ===== SAO LƯU & PHỤC HỒI =====

/**
 * @swagger
 * /api/settings/backup:
 *   post:
 *     summary: Tạo bản sao lưu
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo backup thành công
 */
router.post(
  '/backup',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  settingsController.createBackup
);

/**
 * @swagger
 * /api/settings/backups:
 *   get:
 *     summary: Lấy danh sách bản sao lưu
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bản sao lưu
 */
router.get(
  '/backups',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  settingsController.listBackups
);

/**
 * @swagger
 * /api/settings/backups/restore:
 *   post:
 *     summary: Phục hồi từ bản sao lưu
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backupId
 *             properties:
 *               backupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phục hồi thành công
 */
router.post(
  '/backups/restore',
  requirePermission(PERMISSIONS['SYSTEM_BACKUP_DATA']),
  settingsController.restoreBackup
);

// ===== KIỂM TRA SỨC KHỎE HỆ THỐNG =====

/**
 * @swagger
 * /api/settings/system-health:
 *   get:
 *     summary: Kiểm tra sức khỏe hệ thống
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin sức khỏe hệ thống
 */
router.get(
  '/system-health',
  requirePermission(PERMISSIONS['SYSTEM_CONFIG']),
  settingsController.getSystemHealth
);

module.exports = router;

