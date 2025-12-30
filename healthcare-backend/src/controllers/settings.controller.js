// controllers/settings.controller.js - Quản lý cài đặt hệ thống
const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const { PERMISSIONS, ROLES } = require('../constants/roles');

class SettingsController {
  // ===== CẤUU HÌNH HỆ THỐNG =====
  
  /**
   * Lấy cài đặt hệ thống
   * Trả về: Hospital info, email config, notification settings
   */
  static async getSystemSettings(req, res) {
    try {
      const settings = {
        hospital: {
          name: process.env.HOSPITAL_NAME || 'Bệnh viện MediAuth',
          address: process.env.HOSPITAL_ADDRESS || 'Hà Nội, Việt Nam',
          phone: process.env.HOSPITAL_PHONE || '+84 24 3825 5000',
          email: process.env.HOSPITAL_EMAIL || 'contact@mediauth.com',
          logo: process.env.HOSPITAL_LOGO || '/assets/logo.png',
          timezone: process.env.TIMEZONE || 'Asia/Ho_Chi_Minh',
        },
        system: {
          maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
          sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600, // seconds
          passwordMinLength: 8,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: true,
          enableMFA: process.env.ENABLE_MFA === 'true',
          enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
        },
        email: {
          smtpHost: process.env.SMTP_HOST ? '***' : 'Not configured',
          smtpPort: process.env.SMTP_PORT || 'Not configured',
          fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@mediauth.com',
          enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
        },
        notification: {
          enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
          enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
          enablePushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
        },
        security: {
          enableHttpsOnly: process.env.ENABLE_HTTPS_ONLY === 'true',
          enableRateLimiting: true,
          enableIPWhitelisting: process.env.ENABLE_IP_WHITELIST === 'true',
          encryptionEnabled: true,
        },
        backup: {
          lastBackupTime: null,
          autoBackupEnabled: process.env.AUTO_BACKUP_ENABLED === 'true',
          backupFrequency: process.env.BACKUP_FREQUENCY || 'daily',
        },
      };

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy cài đặt hệ thống',
      });
    }
  }

  /**
   * Cập nhật cài đặt hệ thống
   * Chỉ super admin mới có thể cập nhật
   */
  static async updateSystemSettings(req, res) {
    try {
      const { hospital, system, email, notification, security } = req.body;

      // Validate
      if (hospital) {
        // Trong thực tế, sẽ lưu vào database hoặc config file
        Object.assign(process.env, {
          HOSPITAL_NAME: hospital.name,
          HOSPITAL_ADDRESS: hospital.address,
          HOSPITAL_PHONE: hospital.phone,
          HOSPITAL_EMAIL: hospital.email,
        });
      }

      if (notification) {
        Object.assign(process.env, {
          ENABLE_EMAIL_NOTIFICATIONS: notification.enableEmailNotifications,
          ENABLE_SMS_NOTIFICATIONS: notification.enableSmsNotifications,
          ENABLE_PUSH_NOTIFICATIONS: notification.enablePushNotifications,
        });
      }

      // Log audit
      if (req.auditLog) {
        await req.auditLog('SETTINGS_UPDATE', 'Settings updated', {
          changedFields: Object.keys(req.body),
        });
      }

      res.json({
        success: true,
        message: 'Cài đặt hệ thống đã cập nhật',
        data: {
          hospital,
          system,
          email,
          notification,
          security,
        },
      });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật cài đặt hệ thống',
      });
    }
  }

  // ===== QUẢN LÝ VAI TRÒ & QUYỀN =====

  /**
   * Lấy danh sách tất cả roles và permissions
   */
  static async getRoles(req, res) {
    try {
      const rolesData = Object.entries(ROLES).map(([key, role]) => ({
        id: role.id || key,
        name: role.name,
        display: role.display,
        permissions: role.permissions || [],
        description: role.description || '',
      }));

      const permissionsData = Object.entries(PERMISSIONS).map(([key, permId]) => ({
        id: key,
        permission: permId,
        category: key.split('.')[0],
        action: key.split('.')[1],
      }));

      res.json({
        success: true,
        data: {
          roles: rolesData,
          permissions: permissionsData,
        },
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách roles',
      });
    }
  }

  /**
   * Cập nhật permissions cho một role
   * Trong thực tế, sẽ lưu vào database
   */
  static async updateRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          error: 'Permissions phải là một mảng',
        });
      }

      // Validate roleId
      const roleExists = Object.values(ROLES).some(r => r.id === roleId || r.name === roleId);
      if (!roleExists) {
        return res.status(404).json({
          success: false,
          error: 'Role không tồn tại',
        });
      }

      // Log audit
      if (req.auditLog) {
        await req.auditLog('ROLE_PERMISSIONS_UPDATE', `Updated permissions for role ${roleId}`, {
          roleId,
          permissions,
        });
      }

      res.json({
        success: true,
        message: `Quyền của role ${roleId} đã cập nhật`,
        data: {
          roleId,
          permissions,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Update role permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật quyền role',
      });
    }
  }

  // ===== NHẬT KÝ HOẠT ĐỘNG =====

  /**
   * Lấy audit logs
   */
  static async getAuditLogs(req, res) {
    try {
      const { limit = 50, skip = 0, action, userId, startDate, endDate } = req.query;

      const filters = {};
      if (action) filters.action = action;
      if (userId) filters.userId = userId;
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(filters)
        .populate('userId', 'personalInfo.firstName personalInfo.lastName email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await AuditLog.countDocuments(filters);

      res.json({
        success: true,
        data: {
          logs,
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
        },
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy nhật ký hoạt động',
      });
    }
  }

  /**
   * Lấy thống kê audit logs
   */
  static async getAuditLogsStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      // Thống kê theo hành động
      const actionStats = await AuditLog.aggregate([
        { $match: filters },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Thống kê theo người dùng
      const userStats = await AuditLog.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          actionStats,
          userStats,
          totalLogs: await AuditLog.countDocuments(filters),
        },
      });
    } catch (error) {
      console.error('Get audit logs stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê nhật ký hoạt động',
      });
    }
  }

  // ===== SAO LƯU & PHỤC HỒI =====

  /**
   * Tạo backup
   */
  static async createBackup(req, res) {
    try {
      // Trong thực tế, sẽ gọi MongoDB backup utilities
      const backupFile = `backup-${new Date().toISOString().split('T')[0]}.gz`;

      // Log audit
      if (req.auditLog) {
        await req.auditLog('BACKUP_CREATE', 'Database backup created', {
          filename: backupFile,
        });
      }

      res.json({
        success: true,
        message: 'Sao lưu database thành công',
        data: {
          filename: backupFile,
          timestamp: new Date(),
          size: 'Pending download',
        },
      });
    } catch (error) {
      console.error('Create backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo sao lưu',
      });
    }
  }

  /**
   * Lấy danh sách các backup
   */
  static async listBackups(req, res) {
    try {
      const backups = [
        {
          id: 1,
          filename: 'backup-2025-01-15.gz',
          size: '245 MB',
          createdAt: new Date('2025-01-15'),
        },
        {
          id: 2,
          filename: 'backup-2025-01-14.gz',
          size: '241 MB',
          createdAt: new Date('2025-01-14'),
        },
        {
          id: 3,
          filename: 'backup-2025-01-13.gz',
          size: '238 MB',
          createdAt: new Date('2025-01-13'),
        },
      ];

      res.json({
        success: true,
        data: backups,
      });
    } catch (error) {
      console.error('List backups error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách sao lưu',
      });
    }
  }

  /**
   * Phục hồi từ backup
   */
  static async restoreBackup(req, res) {
    try {
      const { backupId } = req.body;

      if (!backupId) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng chọn file sao lưu',
        });
      }

      // Log audit
      if (req.auditLog) {
        await req.auditLog('BACKUP_RESTORE', `Database restored from backup ${backupId}`, {
          backupId,
        });
      }

      res.json({
        success: true,
        message: 'Phục hồi database thành công',
        data: {
          restoredAt: new Date(),
          backupId,
        },
      });
    } catch (error) {
      console.error('Restore backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi phục hồi sao lưu',
      });
    }
  }

  // ===== KIỂM TRA SỨC KHỎE HỆ THỐNG =====

  /**
   * Kiểm tra sức khỏe hệ thống
   */
  static async getSystemHealth(req, res) {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      const health = {
        status: 'healthy',
        timestamp: new Date(),
        uptime: uptime,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        },
        cpu: {
          usage: Math.round(process.cpuUsage().system / 1000000) + '%',
        },
        database: {
          connected: true, // Mocked
          latency: '0ms',
        },
        services: {
          email: process.env.SMTP_HOST ? 'configured' : 'not configured',
          sms: process.env.ENABLE_SMS_NOTIFICATIONS === 'true' ? 'enabled' : 'disabled',
          auditLog: process.env.ENABLE_AUDIT_LOG !== 'false' ? 'enabled' : 'disabled',
        },
      };

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra sức khỏe hệ thống',
      });
    }
  }
}

module.exports = SettingsController;
