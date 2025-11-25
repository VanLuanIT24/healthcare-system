const authService = require("../services/auth.service");
const { asyncHandler } = require("../middlewares/error.middleware");
const { AUDIT_ACTIONS, auditLog } = require("../middlewares/audit.middleware");

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
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    // ✅ KIỂM TRA BODY
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu là bắt buộc",
        data: null,
      });
    }

    const result = await authService.login(
      email,
      password,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      success: true,
      message: "✅ Đăng nhập thành công! Chào mừng bạn quay lại.",
      data: result,
    });
  });

  /**
   * 🎯 ĐĂNG XUẤT
   */
  logout = asyncHandler(async (req, res) => {
    // ✅ SỬA LỖI: KIỂM TRA req.user TỒN TẠI
    const { refreshToken } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
        data: null,
      });
    }

    const result = await authService.logout(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null,
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
      message: "Làm mới token thành công",
      data: result,
    });
  });

  /**
   * 🎯 ĐĂNG KÝ USER - ✅ ĐÃ SỬA: THÊM IP ADDRESS
   */
  registerUser = [
    auditLog(AUDIT_ACTIONS.USER_CREATE, {
      metadata: { registrationType: "SELF_REGISTER" },
    }),
    asyncHandler(async (req, res) => {
      const userData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress; // ✅ LẤY IP

      console.log(
        "🔍 [REGISTER DEBUG] Incoming userData:",
        JSON.stringify(userData, null, 2)
      );

      // ✅ KIỂM TRA BODY
      if (!userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đăng ký không hợp lệ",
          data: null,
        });
      }

      const result = await authService.registerUser(userData, ipAddress); // ✅ TRUYỀN IP

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });
    }),
  ];

  /**
   * 🎯 QUÊN MẬT KHẨU
   */
  forgotPassword = asyncHandler(async (req, res) => {
    console.log("🔑 [FORGOT PASSWORD] Request body:", req.body);

    // ✅ SỬA LỖI: SỬ DỤNG req.body || {}
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
        data: null,
      });
    }

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
      data: null,
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
      data: null,
    });
  });

  /**
   * 🎯 ĐỔI MẬT KHẨU
   */
  changePassword = [
    auditLog(AUDIT_ACTIONS.PASSWORD_CHANGE),
    asyncHandler(async (req, res) => {
      // ✅ SỬA LỖI: KIỂM TRA req.user TỒN TẠI
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy thông tin người dùng",
          data: null,
        });
      }

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    }),
  ];

  /**
   * 🎯 LẤY THÔNG TIN USER HIỆN TẠI
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    console.log("🔍 [AUTH CONTROLLER] getCurrentUser started");
    console.log("🔍 [AUTH CONTROLLER] req.user:", req.user);
    console.log("🔍 [AUTH CONTROLLER] req.headers:", req.headers);

    // ✅ KIỂM TRA CHI TIẾT req.user
    if (!req.user) {
      console.error("❌ [AUTH CONTROLLER] req.user is UNDEFINED");
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin xác thực người dùng",
        data: null,
      });
    }

    if (!req.user._id) {
      console.error("❌ [AUTH CONTROLLER] req.user._id is MISSING");
      console.error(
        "❌ [AUTH CONTROLLER] req.user content:",
        JSON.stringify(req.user, null, 2)
      );
      return res.status(401).json({
        success: false,
        message: "Thông tin người dùng không đầy đủ",
        data: null,
      });
    }

    const userId = req.user._id;
    console.log("🔍 [AUTH CONTROLLER] Getting current user with ID:", userId);

    try {
      const user = await authService.getCurrentUser(userId);

      console.log("✅ [AUTH CONTROLLER] User data retrieved successfully");
      res.status(200).json({
        success: true,
        message: "Lấy thông tin user thành công",
        data: { user },
      });
    } catch (error) {
      console.error(
        "❌ [AUTH CONTROLLER] Error getting current user:",
        error.message
      );
      throw error;
    }
  });

  /**
   * 🎯 HEALTH CHECK (CHO LOAD BALANCER)
   */
  healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Auth service is healthy",
      data: {
        service: "authentication",
        status: "operational",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      },
    });
  });
}

module.exports = new AuthController();
