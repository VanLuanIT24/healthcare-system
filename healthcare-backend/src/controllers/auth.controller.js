const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { AUDIT_ACTIONS, auditLog } = require('../middlewares/audit.middleware');

/**
 * 🛡️ AUTHENTICATION CONTROLLER CHO HEALTHCARE SYSTEM - HOÀN THIỆN
 */

class AuthController {
  /**
   * 🎯 ĐĂNG NHẬP
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // ✅ KIỂM TRA BODY
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc',
        data: null
      });
    }

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  });

  /**
   * 🎯 ĐĂNG XUẤT - CẬP NHẬT: HỖ TRỢ NHIỀU CÁCH ĐĂNG XUẤT
   */
  logout = asyncHandler(async (req, res) => {
    const { refreshToken, sessionId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng',
        data: null
      });
    }

    const result = await authService.logout(userId, refreshToken, sessionId);

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
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu đăng ký không hợp lệ',
          data: null
        });
      }

      const result = await authService.registerUser(userData, ipAddress);

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
    console.log('🔑 [FORGOT PASSWORD] Request body:', req.body);
    
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc',
        data: null
      });
    }

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
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null
        });
      }

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
    console.log('🔍 [AUTH CONTROLLER] getCurrentUser started');
    
    if (!req.user) {
      console.error('❌ [AUTH CONTROLLER] req.user is UNDEFINED');
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin xác thực người dùng',
        data: null
      });
    }

    if (!req.user._id) {
      console.error('❌ [AUTH CONTROLLER] req.user._id is MISSING');
      return res.status(401).json({
        success: false,
        message: 'Thông tin người dùng không đầy đủ',
        data: null
      });
    }

    const userId = req.user._id;
    console.log('🔍 [AUTH CONTROLLER] Getting current user with ID:', userId);

    try {
      const user = await authService.getCurrentUser(userId);
      
      console.log('✅ [AUTH CONTROLLER] User data retrieved successfully');
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin user thành công',
        data: { user }
      });
    } catch (error) {
      console.error('❌ [AUTH CONTROLLER] Error getting current user:', error.message);
      throw error;
    }
  });

  /**
   * 🎯 LẤY DANH SÁCH SESSION CỦA USER - HÀM MỚI
   */
  getUserSessions = [
    auditLog(AUDIT_ACTIONS.USER_VIEW_SESSIONS),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null
        });
      }

      const sessions = await authService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách session thành công',
        data: { sessions }
      });
    })
  ];

  /**
   * 🎯 THU HỒI SESSION - HÀM MỚI
   */
  revokeSession = [
    auditLog(AUDIT_ACTIONS.SESSION_REVOKE),
    asyncHandler(async (req, res) => {
      const { sessionId } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null
        });
      }

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID là bắt buộc',
          data: null
        });
      }

      const result = await authService.revokeSession(sessionId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    })
  ];

  /**
   * 🎯 THU HỒI TẤT CẢ SESSION (LOGOUT ALL) - HÀM MỚI
   */
  logoutAllSessions = [
    auditLog(AUDIT_ACTIONS.SESSION_REVOKE_ALL),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null
        });
      }

      // Gọi logout mà không có refreshToken hoặc sessionId để logout tất cả
      const result = await authService.logout(userId);

      res.status(200).json({
        success: true,
        message: 'Đã đăng xuất khỏi tất cả thiết bị',
        data: null
      });
    })
  ];

  /**
 * 🎯 VERIFY EMAIL - HÀM MỚI
 */
verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const result = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: result.message,
    data: { user: result.user }
  });
});

/**
 * 🎯 RESEND VERIFICATION EMAIL - HÀM MỚI
 */
resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const result = await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: null
  });
});

  /**
   * 🎯 HEALTH CHECK
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