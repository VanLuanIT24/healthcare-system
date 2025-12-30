// routes/settings.routes.js - Cài đặt hệ thống
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// ===== CẤUU HÌNH HỆ THỐNG =====
router.get(
  '/',
  requirePermission(PERMISSIONS['SYSTEM.CONFIG']),
  settingsController.getSystemSettings
);

router.put(
  '/',
  requirePermission(PERMISSIONS['SYSTEM.CONFIG']),
  settingsController.updateSystemSettings
);

// ===== QUẢN LÝ VAI TRÒ & QUYỀN =====
router.get(
  '/roles',
  requirePermission(PERMISSIONS['SYSTEM.CONFIG']),
  settingsController.getRoles
);

router.put(
  '/roles/:roleId/permissions',
  requirePermission(PERMISSIONS['SYSTEM.CONFIG']),
  settingsController.updateRolePermissions
);

// ===== NHẬT KÝ HOẠT ĐỘNG =====
router.get(
  '/audit-logs',
  requirePermission(PERMISSIONS['SYSTEM.VIEW_AUDIT_LOG']),
  settingsController.getAuditLogs
);

router.get(
  '/audit-logs/stats',
  requirePermission(PERMISSIONS['SYSTEM.VIEW_AUDIT_LOG']),
  settingsController.getAuditLogsStats
);

// ===== SAO LƯU & PHỤC HỒI =====
router.post(
  '/backup',
  requirePermission(PERMISSIONS['SYSTEM.BACKUP_DATA']),
  settingsController.createBackup
);

router.get(
  '/backups',
  requirePermission(PERMISSIONS['SYSTEM.BACKUP_DATA']),
  settingsController.listBackups
);

router.post(
  '/backups/restore',
  requirePermission(PERMISSIONS['SYSTEM.BACKUP_DATA']),
  settingsController.restoreBackup
);

// ===== KIỂM TRA SỨC KHỎE HỆ THỐNG =====
router.get(
  '/system-health',
  requirePermission(PERMISSIONS['SYSTEM.CONFIG']),
  settingsController.getSystemHealth
);

module.exports = router;

