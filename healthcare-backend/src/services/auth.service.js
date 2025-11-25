const User = require("../models/user.model");
const Patient = require("../models/patient.model");
const AuditLog = require("../models/auditLog.model");
const {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  randomTokenHex,
} = require("../utils/hash");
const {
  generateTokenPair,
  verifyRefreshToken,
  signAccessToken,
} = require("../utils/jwt");
const { ROLES } = require("../constants/roles");
const { AppError, ERROR_CODES } = require("../middlewares/error.middleware");
const emailService = require("../utils/email");

/**
 * 🛡️ AUTHENTICATION SERVICE CHO HEALTHCARE SYSTEM
 * - Xử lý logic nghiệp vụ authentication
 * - Tuân thủ bảo mật HIPAA và healthcare
 */

class AuthService {
  /**
   * 🎯 ĐĂNG NHẬP
   */
  async login(email, password, ipAddress, userAgent) {
    try {
      console.log("🔐 [AUTH SERVICE] Login attempt:", { email, ipAddress });

      // 🎯 TÌM USER THEO EMAIL
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        await this.logFailedLoginAttempt(email, ipAddress, "USER_NOT_FOUND");
        throw new AppError(
          "❌ Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.",
          401,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        );
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      const userStatus = user.status || "ACTIVE";

      if (userStatus !== "ACTIVE") {
        await this.logFailedLoginAttempt(
          user.email,
          ipAddress,
          "ACCOUNT_INACTIVE"
        );
        throw new AppError(
          this.getAccountStatusMessage(userStatus),
          403,
          ERROR_CODES.AUTH_ACCOUNT_LOCKED
        );
      }

      // 🎯 XÁC THỰC MẬT KHẨU
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        // Xử lý increment login attempts
        try {
          if (typeof user.incrementLoginAttempts === "function") {
            await user.incrementLoginAttempts();
          } else {
            await User.findByIdAndUpdate(user._id, {
              $inc: { loginAttempts: 1 },
            });
          }
        } catch (updateError) {
          console.error(
            "❌ Error updating login attempts:",
            updateError.message
          );
        }

        await this.logFailedLoginAttempt(
          user.email,
          ipAddress,
          "INVALID_PASSWORD"
        );

        const currentAttempts = (user.loginAttempts || 0) + 1;
        const attemptsLeft = 5 - currentAttempts;

        if (attemptsLeft > 0) {
          throw new AppError(
            `❌ Mật khẩu không đúng. Bạn còn ${attemptsLeft} lần thử. Nếu thử hết lần, tài khoản sẽ bị khóa trong 2 giờ.`,
            401,
            ERROR_CODES.AUTH_INVALID_CREDENTIALS
          );
        } else {
          await User.findByIdAndUpdate(user._id, {
            $set: {
              lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
              status: "LOCKED",
            },
          });

          throw new AppError(
            "🔒 Tài khoản của bạn đã bị khóa tạm thời do đăng nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 2 giờ hoặc liên hệ hỗ trợ để được mở khóa.",
            423,
            ERROR_CODES.AUTH_ACCOUNT_LOCKED
          );
        }
      }

      // 🎯 RESET LOGIN ATTEMPTS SAU KHI ĐĂNG NHẬP THÀNH CÔNG
      await User.findByIdAndUpdate(user._id, {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          status: "ACTIVE",
        },
        $currentDate: {
          lastLogin: true,
        },
      });

      // 🎯 TẠO TOKENS
      const tokens = generateTokenPair(user);

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG NHẬP THÀNH CÔNG
      await AuditLog.logAction({
        action: "LOGIN",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        ipAddress,
        userAgent,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "AUTHENTICATION",
      });

      console.log(`✅ User logged in successfully: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐĂNG XUẤT
   */
  async logout(userId, refreshToken) {
    try {
      await AuditLog.logAction({
        action: "LOGOUT",
        userId,
        resource: "User",
        resourceId: userId,
        success: true,
        category: "AUTHENTICATION",
      });

      console.log(`✅ User logged out: ${userId}`);
      return { message: "✅ Đăng xuất thành công! Tạm biệt, hẹn gặp lại bạn!" };
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 REFRESH TOKEN
   */
  async refreshToken(refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await User.findById(payload.sub);
      if (!user || (user.status && user.status !== "ACTIVE")) {
        throw new AppError(
          "Token không hợp lệ",
          401,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      const accessToken = signAccessToken(user);

      await AuditLog.logAction({
        action: "TOKEN_REFRESH",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "AUTHENTICATION",
      });

      return {
        accessToken,
        expiresIn: 15 * 60,
      };
    } catch (error) {
      console.error("❌ Refresh token error:", error.message);
      throw new AppError(
        "Refresh token không hợp lệ",
        401,
        ERROR_CODES.AUTH_INVALID_TOKEN
      );
    }
  }

  /**
   * 🎯 ĐĂNG KÝ USER
   * ⚠️ IMPORTANT: Người dùng tự đăng ký luôn là PATIENT
   * Chỉ Admin có thể tạo người dùng với role khác hoặc đổi role sau
   */
  async registerUser(userData, ipAddress = "0.0.0.0") {
    try {
      const { email, password, personalInfo } = userData;
      const role = "PATIENT"; // ✅ FORCE ROLE LÀ PATIENT, IGNORE INPUT

      console.log("👤 [AUTH SERVICE] Starting user registration:", { email });
      console.log(
        "📋 [AUTH SERVICE] Full userData:",
        JSON.stringify(userData, null, 2)
      );
      console.log(
        "👤 [AUTH SERVICE] PersonalInfo:",
        JSON.stringify(personalInfo, null, 2)
      );
      console.log("⚠️ [AUTH SERVICE] Force role to PATIENT (ignoring input)");

      // 🎯 KIỂM TRA EMAIL ĐÃ TỒN TẠI
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError(
          "Email đã được sử dụng",
          409,
          ERROR_CODES.DUPLICATE_ENTRY
        );
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `❌ Mật khẩu không đủ mạnh. Mật khẩu cần có:\n${passwordValidation.errors.join(
            "\n"
          )}`,
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 TẠO USER MỚI
      // ✅ SUPER_ADMIN, DOCTOR, NURSE,... được tạo với status ACTIVE
      // ✅ PATIENT được tạo với status ACTIVE
      const user = new User({
        email: email.toLowerCase(),
        password: password,
        role,
        personalInfo,
        status: "ACTIVE", // ✅ TẤT CẢ NGƯỜI DÙNG MỚI ĐỀU ACTIVE
      });

      await user.save();
      console.log("✅ User saved successfully");

      // 🎯 NẾU LÀ PATIENT, TẠO HỒ SƠ BỆNH NHÂN
      if (role === "PATIENT") {
        await this.createPatientProfile(user);
      }

      // 🎯 GỬI EMAIL CHÀO MỪNG - SỬA LỖI Ở ĐÂY
      if (process.env.SEND_WELCOME_EMAIL === "true") {
        try {
          await emailService.sendWelcomeEmail(user);
          console.log("✅ Welcome email sent successfully");
        } catch (emailError) {
          console.error(
            "❌ Welcome email failed, but user was created:",
            emailError.message
          );
          // Không throw error để không ảnh hưởng đến quá trình đăng ký
        }
      }

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG KÝ
      await AuditLog.logAction({
        action: "USER_CREATE",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        ipAddress: ipAddress,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "USER_MANAGEMENT",
        metadata: { registrationType: "SELF_REGISTER" },
      });

      console.log(`✅ User registered: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        message:
          role === "PATIENT"
            ? "✅ Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ."
            : "✅ Đăng ký thành công! Tài khoản đang chờ phê duyệt từ quản trị viên.",
      };
    } catch (error) {
      console.error("❌ Registration error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 QUÊN MẬT KHẨU - SỬA LỖI GỬI EMAIL
   */
  async forgotPassword(email) {
    try {
      console.log("🔑 [AUTH SERVICE] Forgot password request:", { email });

      // 🎯 TÌM USER
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // 🎯 KHÔNG TIẾT LỘ EMAIL CÓ TỒN TẠI HAY KHÔNG
        console.log(
          `🔒 Password reset requested for non-existent email: ${email}`
        );
        return {
          message:
            "📧 Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.",
        };
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      if (user.status !== "ACTIVE") {
        throw new AppError(
          this.getAccountStatusMessage(user.status),
          403,
          ERROR_CODES.AUTH_ACCOUNT_LOCKED
        );
      }

      // 🎯 TẠO RESET TOKEN
      const resetToken = randomTokenHex(32);
      const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 giờ

      // 🎯 LƯU TOKEN
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // 🎯 GỬI EMAIL ĐẶT LẠI MẬT KHẨU - SỬA LỖI Ở ĐÂY
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("❌ Password reset email failed:", emailError.message);
        // Vẫn trả về success để không tiết lộ thông tin
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: "PASSWORD_RESET_REQUEST",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "AUTHENTICATION",
      });

      return {
        message: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
      };
    } catch (error) {
      console.error("❌ Forgot password error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐẶT LẠI MẬT KHẨU
   */
  async resetPassword(token, newPassword) {
    try {
      console.log("🔑 [AUTH SERVICE] Reset password attempt with token");

      // 🎯 TÌM USER THEO TOKEN
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new AppError(
          "🔒 Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.",
          400,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `❌ Mật khẩu không đủ mạnh. Mật khẩu cần có:\n${passwordValidation.errors.join(
            "\n"
          )}`,
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 MÃ HÓA MẬT KHẨU MỚI
      const hashedPassword = await hashPassword(newPassword);

      // 🎯 CẬP NHẬT MẬT KHẨU VÀ XÓA TOKEN
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.status = "ACTIVE";
      await user.save();

      // 🎯 GỬI EMAIL THÔNG BÁO - SỬA LỖI Ở ĐÂY
      try {
        await emailService.sendPasswordChangedConfirmation(user);
        console.log(`✅ Password changed confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error("❌ Password changed email failed:", emailError.message);
        // Không throw error để không ảnh hưởng đến quá trình reset
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: "PASSWORD_RESET_SUCCESS",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "AUTHENTICATION",
      });

      console.log(`✅ Password reset successful for: ${user.email}`);

      return {
        message:
          "✅ Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.",
      };
    } catch (error) {
      console.error("❌ Reset password error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐỔI MẬT KHẨU
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Người dùng không tồn tại",
          404,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      // 🎯 XÁC THỰC MẬT KHẨU HIỆN TẠI
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        await AuditLog.logAction({
          action: "PASSWORD_CHANGE_FAILED",
          userId: user._id,
          userRole: user.role,
          userEmail: user.email,
          resource: "User",
          resourceId: user._id,
          success: false,
          category: "AUTHENTICATION",
          errorMessage: "Mật khẩu hiện tại không đúng",
        });

        throw new AppError(
          "❌ Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.",
          401,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        );
      }

      // 🎯 KIỂM TRA MẬT KHẨU MỚI KHÁC MẬT KHẨU CŨ
      const isSamePassword = await comparePassword(newPassword, user.password);
      if (isSamePassword) {
        throw new AppError(
          "⚠️ Mật khẩu mới phải khác mật khẩu hiện tại. Vui lòng chọn mật khẩu khác.",
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `❌ Mật khẩu không đủ mạnh. Mật khẩu cần có:\n${passwordValidation.errors.join(
            "\n"
          )}`,
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 CẬP NHẬT MẬT KHẨU
      user.password = await hashPassword(newPassword);
      await user.save();

      // 🎯 GỬI EMAIL THÔNG BÁO - SỬA LỖI Ở ĐÂY
      try {
        await emailService.sendPasswordChangedConfirmation(user);
        console.log(`✅ Password changed confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error("❌ Password changed email failed:", emailError.message);
        // Không throw error để không ảnh hưởng đến quá trình đổi mật khẩu
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: "PASSWORD_CHANGE_SUCCESS",
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: "User",
        resourceId: user._id,
        success: true,
        category: "AUTHENTICATION",
      });

      console.log(`✅ Password changed successfully for: ${user.email}`);

      return {
        message:
          "✅ Đổi mật khẩu thành công! Mật khẩu mới của bạn đã được lưu.",
      };
    } catch (error) {
      console.error("❌ Change password error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN USER HIỆN TẠI
   */
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId)
        .select(
          "-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil"
        )
        .lean();

      if (!user) {
        throw new AppError(
          "Người dùng không tồn tại",
          404,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      return this.sanitizeUser(user);
    } catch (error) {
      console.error("❌ Get current user error:", error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO HỒ SƠ BỆNH NHÂN
   */
  async createPatientProfile(user) {
    try {
      const patientId = `PAT${Date.now().toString().slice(-8)}`;

      const patient = new Patient({
        userId: user._id,
        patientId,
        bloodType: "UNKNOWN",
        allergies: [],
        chronicConditions: [],
      });

      await patient.save();
      console.log(`✅ Patient profile created: ${patientId}`);
    } catch (error) {
      console.error("❌ Create patient profile error:", error.message);
    }
  }

  /**
   * 🎯 LOG FAILED LOGIN ATTEMPT
   */
  async logFailedLoginAttempt(email, ipAddress, reason) {
    try {
      await AuditLog.logAction({
        action: "LOGIN_FAILED",
        userEmail: email,
        ipAddress,
        resource: "User",
        success: false,
        category: "AUTHENTICATION",
        metadata: { reason },
      });
    } catch (error) {
      console.error("❌ Failed to log failed login attempt:", error.message);
    }
  }

  /**
   * 🎯 SANITIZE USER DATA
   */
  sanitizeUser(user) {
    const sanitized = { ...user };

    delete sanitized.password;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpires;
    delete sanitized.loginAttempts;
    delete sanitized.lockUntil;

    return sanitized;
  }

  /**
   * 🎯 THÔNG BÁO TRẠNG THÁI TÀI KHOẢN
   */
  getAccountStatusMessage(status) {
    const messages = {
      ACTIVE: "✅ Tài khoản đang hoạt động",
      INACTIVE:
        "⚠️ Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.",
      SUSPENDED:
        "🚫 Tài khoản đã bị tạm ngưng. Liên hệ hỗ trợ để biết thêm chi tiết.",
      LOCKED:
        "🔒 Tài khoản đã bị khóa. Vui lòng thử lại sau 2 giờ hoặc liên hệ hỗ trợ.",
      PENDING_APPROVAL:
        "⏳ Tài khoản đang chờ phê duyệt từ quản trị viên. Vui lòng quay lại sau.",
    };

    return messages[status] || "❌ Tài khoản không hoạt động";
  }

  /**
   * 🧪 TEST EMAIL FUNCTIONALITY
   */
  async testEmailFunctionality() {
    try {
      console.log("🧪 Testing email functionality...");

      // Test với user mẫu
      const testUser = {
        email: "test@healthcare.vn",
        personalInfo: {
          firstName: "Test",
          lastName: "User",
        },
        role: "PATIENT",
      };

      // Test welcome email
      const welcomeResult = await emailService.sendWelcomeEmail(testUser);
      console.log("✅ Welcome email test:", welcomeResult);

      // Test reset password email
      const resetResult = await emailService.sendPasswordResetEmail(
        testUser,
        "test_token_123"
      );
      console.log("✅ Reset password email test:", resetResult);

      return { success: true, message: "Email functionality test completed" };
    } catch (error) {
      console.error("❌ Email functionality test failed:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AuthService();
