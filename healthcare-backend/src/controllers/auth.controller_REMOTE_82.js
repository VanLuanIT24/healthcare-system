const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { AUDIT_ACTIONS, auditLog } = require('../middlewares/audit.middleware');

/**
 * 🛡️ AUTHENTICATION CONTROLLER CHO HEALTHCARE SYSTEM
 * - Xử lý HTTP requests và responses
 * - Gọi service layer và trả về response phù hợp
 */

class AuthController {
  /**
   * 🎯 ĐĂNG NHẬP
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  });

  /**
   * 🎯 ĐĂNG XUẤT
   */
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    const result = await authService.logout(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  });

  /**
   * 🎯 REFRESH TOKEN
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Làm mới token thành công',
      data: result
    });
  });

  /**
   * 🎯 ĐĂNG KÝ USER
   */
  registerUser = [
    auditLog(AUDIT_ACTIONS.USER_CREATE, { metadata: { registrationType: 'SELF_REGISTER' } }),
    asyncHandler(async (req, res) => {
      const userData = req.body;

      const result = await authService.registerUser(userData);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user
        }
      });
    })
  ];

  /**
   * 🎯 QUÊN MẬT KHẨU
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  });

  /**
   * 🎯 ĐẶT LẠI MẬT KHẨU
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  });

  /**
   * 🎯 ĐỔI MẬT KHẨU
   */
  changePassword = [
    auditLog(AUDIT_ACTIONS.PASSWORD_CHANGE),
    asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    })
  ];

  /**
   * 🎯 LẤY THÔNG TIN USER HIỆN TẠI
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin user thành công',
      data: { user }
    });
  });

  /**
   * 🎯 HEALTH CHECK (CHO LOAD BALANCER)
   */
  healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Auth service is healthy',
      data: {
        service: 'authentication',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  });
}

module.exports = new AuthController();