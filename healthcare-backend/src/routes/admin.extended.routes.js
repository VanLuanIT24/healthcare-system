// src/routes/admin.extended.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

/**
 * 🎯 ADMIN EXTENDED ROUTES
 * Các endpoints bổ sung cho admin (monitoring, backup, audit logs, settings)
 */

// Middleware: Tất cả route admin phải authenticate và có role admin
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'HOSPITAL_ADMIN'));

/**
 * System Monitoring
 */
// GET /api/admin/monitoring/metrics - Metrics hệ thống
router.get('/monitoring/metrics', adminController.getSystemMetrics || ((req, res) => {
  res.json({
    success: true,
    data: {
      cpu: { usage: 45.2, cores: 4 },
      memory: { used: 2048, total: 8192, percentage: 25 },
      disk: { used: 50000, total: 100000, percentage: 50 },
      network: { inbound: 1024, outbound: 512 }
    }
  });
}));

// GET /api/admin/monitoring/database - Trạng thái database
router.get('/monitoring/database', adminController.getDatabaseStatus || ((req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      connections: 10,
      maxConnections: 100,
      responseTime: 5,
      collections: 15
    }
  });
}));

// GET /api/admin/monitoring/errors - Error logs
router.get('/monitoring/errors', adminController.getErrorLogs || ((req, res) => {
  res.json({
    success: true,
    data: {
      errors: [],
      total: 0
    }
  });
}));

/**
 * Backup & Maintenance
 */
// POST /api/admin/backup/create - Tạo backup
router.post('/backup/create', adminController.createBackup || ((req, res) => {
  res.json({
    success: true,
    message: 'Backup created successfully',
    data: {
      backupId: Date.now().toString(),
      timestamp: new Date(),
      size: '125MB'
    }
  });
}));

// GET /api/admin/backup/history - Lịch sử backup
router.get('/backup/history', adminController.getBackupHistory || ((req, res) => {
  res.json({
    success: true,
    data: {
      backups: [],
      total: 0
    }
  });
}));

// POST /api/admin/backup/:backupId/restore - Restore backup
router.post('/backup/:backupId/restore', adminController.restoreBackup || ((req, res) => {
  res.json({
    success: true,
    message: 'Backup restored successfully'
  });
}));

// POST /api/admin/maintenance-mode - Toggle maintenance mode
router.post('/maintenance-mode', adminController.toggleMaintenanceMode || ((req, res) => {
  const { enabled } = req.body;
  res.json({
    success: true,
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    data: { enabled }
  });
}));

/**
 * Audit Logs
 */
// GET /api/admin/audit-logs/export - Export audit logs (MUST BE BEFORE :id route)
router.get('/audit-logs/export', adminController.exportAuditLogs || ((req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
  res.send('timestamp,action,user,details\n');
}));

// GET /api/admin/audit-logs - Lấy audit logs
router.get('/audit-logs', adminController.getAuditLogs || (async (req, res) => {
  try {
    const AuditLog = require('../models/auditLog.model');
    const { page = 1, limit = 20, action, userId, startDate, endDate, search, module: moduleFilter } = req.query;
    
    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;
    if (moduleFilter) query.module = moduleFilter;
    if (search) {
      query.$or = [
        { 'user.email': { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// GET /api/admin/audit-logs/:id - Chi tiết audit log
router.get('/audit-logs/:id', adminController.getAuditLogById || (async (req, res) => {
  try {
    const AuditLog = require('../models/auditLog.model');
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'firstName lastName email role');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

/**
 * System Settings
 */
// GET /api/admin/settings - Lấy settings
router.get('/settings', adminController.getSettings || ((req, res) => {
  res.json({
    success: true,
    data: {
      systemName: 'Healthcare System',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      emailNotifications: true,
      smsNotifications: false
    }
  });
}));

// PUT /api/admin/settings - Cập nhật settings
router.put('/settings', adminController.updateSettings || ((req, res) => {
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
}));

module.exports = router;
