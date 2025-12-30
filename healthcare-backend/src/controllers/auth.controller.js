// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class AuthController {
  // Đăng nhập
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu',
      });
    }

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  });

  // Đăng xuất (hỗ trợ logout một hoặc tất cả phiên)
  logout = asyncHandler(async (req, res) => {
    const { refreshToken, sessionId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ',
      });
    }

    await authService.logout(userId, refreshToken, sessionId);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  });

  // Làm mới token
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token là bắt buộc',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Làm mới token thành công',
      data: result,
    });
  });

  // Đăng ký người dùng
  registerUser = [
    auditLog(AUDIT_ACTIONS.USER_CREATE, { metadata: { registrationType: 'SELF_REGISTER' } }),
    asyncHandler(async (req, res) => {
      const userData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Email và mật khẩu là bắt buộc',
        });
      }

      const result = await authService.registerUser(userData, ipAddress);

      res.status(201).json({
        success: true,
        message: result.message,
        data: { user: result.user },
      });
    }),
  ];

  // Quên mật khẩu
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email',
      });
    }

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Đặt lại mật khẩu
  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc',
      });
    }

    const result = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Đổi mật khẩu (khi đã đăng nhập)
  changePassword = [
    auditLog(AUDIT_ACTIONS.PASSWORD_CHANGE),
    asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }),
  ];

  // Lấy thông tin người dùng hiện tại
  getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập',
      });
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin thành công',
      data: { user },
    });
  });

  // Lấy danh sách session
  getUserSessions = [
    auditLog(AUDIT_ACTIONS.USER_VIEW_SESSIONS),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      const sessions = await authService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách session thành công',
        data: { sessions },
      });
    }),
  ];

  // Đăng xuất tất cả các thiết bị khác (giữ phiên hiện tại)
  logoutAllOtherSessions = [
    auditLog(AUDIT_ACTIONS.SESSION_REVOKE_OTHERS),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;
      const currentSessionId = req.sessionId; // Được gán từ middleware authenticate

      if (!userId || !currentSessionId) {
        return res.status(401).json({
          success: false,
          message: 'Phiên không hợp lệ',
        });
      }

      await authService.logout(userId, null, null, currentSessionId);

      res.status(200).json({
        success: true,
        message: 'Đã đăng xuất khỏi tất cả các thiết bị khác',
      });
    }),
  ];

  // Thu hồi session cụ thể
  revokeSession = [
    auditLog(AUDIT_ACTIONS.SESSION_REVOKE),
    asyncHandler(async (req, res) => {
      const { sessionId } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID là bắt buộc',
        });
      }

      await authService.revokeSession(sessionId, userId);

      res.status(200).json({
        success: true,
        message: 'Đã thu hồi session thành công',
      });
    }),
  ];

  // Đăng xuất tất cả session
  logoutAllSessions = [
    auditLog(AUDIT_ACTIONS.SESSION_REVOKE_ALL),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      await authService.logoutAll(userId);

      res.status(200).json({
        success: true,
        message: 'Đã đăng xuất khỏi tất cả thiết bị',
      });
    }),
  ];

  // Xác thực email
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }

    const result = await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { user: result.user },
    });
  });

  // Gửi lại email xác thực
  resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email',
      });
    }

    const result = await authService.resendVerification(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Lấy profile của người dùng hiện tại
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập',
      });
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy hồ sơ thành công',
      data: { user },
    });
  });

  // Cập nhật profile của người dùng hiện tại
  updateProfile = [
    auditLog(AUDIT_ACTIONS.USER_UPDATE),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;
      const { personalInfo } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      if (!personalInfo) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu hồ sơ là bắt buộc',
        });
      }

      const User = require('../models/user.model');
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      // Cập nhật thông tin cá nhân
      if (personalInfo.firstName) user.firstName = personalInfo.firstName;
      if (personalInfo.lastName) user.lastName = personalInfo.lastName;
      if (personalInfo.phone) user.phone = personalInfo.phone;
      if (personalInfo.gender) user.gender = personalInfo.gender;
      if (personalInfo.dateOfBirth) user.dateOfBirth = personalInfo.dateOfBirth;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ thành công',
        data: { user: updatedUser },
      });
    }),
  ];

  // Upload avatar/profile picture
  uploadAvatar = [
    auditLog(AUDIT_ACTIONS.USER_UPDATE),
    asyncHandler(async (req, res) => {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu đăng nhập',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không có file được tải lên',
        });
      }

      const User = require('../models/user.model');
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      // Update avatar path
      if (!user.personalInfo) {
        user.personalInfo = {};
      }
      user.personalInfo.profilePicture = req.file.filename;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        message: 'Tải lên ảnh đại diện thành công',
        data: {
          user: updatedUser,
          profilePicture: updatedUser.personalInfo.profilePicture,
          profilePictureUrl: `/uploads/profiles/${updatedUser.personalInfo.profilePicture}`,
        },
      });
    }),
  ];

  // Health check
  healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Dịch vụ xác thực hoạt động bình thường',
      data: {
        service: 'authentication',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
    });
  });
}

module.exports = new AuthController();