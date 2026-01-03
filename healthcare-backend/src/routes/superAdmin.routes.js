// src/routes/superAdmin.routes.js
const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');
const superAdminService = require('../services/superAdmin.service');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// 🔒 RATE LIMITING CHO SUPER ADMIN ENDPOINTS
const superAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Chỉ 5 request mỗi 15 phút
  message: {
    error: 'Quá nhiều request đến endpoint Super Admin'
  }
});

/**
 * @swagger
 * /api/super-admin/status:
 *   get:
 *     summary: Kiểm tra trạng thái Super Admin
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trạng thái Super Admin
 *       403:
 *         description: Không có quyền truy cập
 */
/**
 * @route   GET /api/super-admin/status
 * @desc    Kiểm tra trạng thái Super Admin (Chỉ Super Admin)
 * @access  Private (Super Admin only)
 */
router.get(
  '/status',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  superAdminLimiter,
  async (req, res) => {
    try {
      const status = await superAdminService.getSuperAdminStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Không thể lấy trạng thái Super Admin'
      });
    }
  }
);

/**
 * @swagger
 * /api/super-admin/reset:
 *   post:
 *     summary: Reset Super Admin (chỉ Development)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reset thành công
 *       403:
 *         description: Không cho phép trong production
 */
/**
 * @route   POST /api/super-admin/reset
 * @desc    Reset Super Admin (Chỉ Development)
 * @access  Private (Super Admin only)
 */
router.post(
  '/reset',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  superAdminLimiter,
  async (req, res) => {
    try {
      // Chỉ cho phép reset trong môi trường development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Không thể reset Super Admin trong production'
        });
      }

      const newAdmin = await superAdminService.resetSuperAdmin();
      
      res.json({
        success: true,
        message: 'Đã reset Super Admin thành công',
        data: {
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/super-admin/system-health:
 *   get:
 *     summary: Kiểm tra sức khỏe hệ thống (Super Admin)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin sức khỏe hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeVersion:
 *                   type: string
 *                 platform:
 *                   type: string
 *                 memory:
 *                   type: object
 *                 uptime:
 *                   type: number
 */
/**
 * @route   GET /api/super-admin/system-health
 * @desc    Kiểm tra sức khỏe hệ thống (Super Admin dashboard)
 * @access  Private (Super Admin only)
 */
router.get(
  '/system-health',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      // Lấy thông tin hệ thống
      const systemHealth = {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: systemHealth
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Không thể lấy thông tin hệ thống'
      });
    }
  }
);

module.exports = router;