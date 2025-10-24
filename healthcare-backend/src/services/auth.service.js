const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const AuditLog = require('../models/auditLog.model');
const { 
  hashPassword, 
  comparePassword, 
  validatePasswordStrength,
  randomTokenHex 
} = require('../utils/hash');
const { 
  generateTokenPair, 
  verifyRefreshToken,
  signAccessToken
} = require('../utils/jwt');
const { ROLES } = require('../constants/roles');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const emailService = require('../utils/email');

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
      // 🎯 TÌM USER THEO EMAIL
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        await this.logFailedLoginAttempt(email, ipAddress, 'USER_NOT_FOUND');
        throw new AppError('Email hoặc mật khẩu không đúng', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      if (user.status !== 'ACTIVE') {
        await this.logFailedLoginAttempt(user.email, ipAddress, 'ACCOUNT_INACTIVE');
        throw new AppError(this.getAccountStatusMessage(user.status), 403, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
      }

      // 🎯 KIỂM TRA KHÓA TÀI KHOẢN TẠM THỜI
      if (user.isLocked && user.lockUntil > new Date()) {
        await this.logFailedLoginAttempt(user.email, ipAddress, 'ACCOUNT_LOCKED');
        throw new AppError('Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau 2 giờ.', 423, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
      }

      // 🎯 XÁC THỰC MẬT KHẨU
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        await this.logFailedLoginAttempt(user.email, ipAddress, 'INVALID_PASSWORD');
        
        const attemptsLeft = 5 - user.loginAttempts;
        if (attemptsLeft > 0) {
          throw new AppError(
            `Mật khẩu không đúng. Còn ${attemptsLeft} lần thử.`, 
            401, 
            ERROR_CODES.AUTH_INVALID_TOKEN
          );
        } else {
          throw new AppError(
            'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 2 giờ.',
            423,
            ERROR_CODES.AUTH_ACCOUNT_LOCKED
          );
        }
      }

      // 🎯 RESET LOGIN ATTEMPTS SAU KHI ĐĂNG NHẬP THÀNH CÔNG
      await User.findByIdAndUpdate(user._id, {
        $set: { 
          loginAttempts: 0,
          lockUntil: null 
        },
        $currentDate: { 
          lastLogin: true 
        }
      });

      // 🎯 TẠO TOKENS
      const tokens = generateTokenPair(user);

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG NHẬP THÀNH CÔNG
      await AuditLog.create({
        action: 'LOGIN',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        ipAddress,
        userAgent,
        success: true,
        category: 'AUTHENTICATION'
      });

      console.log(`🔐 User logged in: ${user.email} (${user.role}) from IP: ${ipAddress}`);

      return {
        user: this.sanitizeUser(user),
        tokens
      };

    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐĂNG XUẤT
   */
  async logout(userId, refreshToken) {
    try {
      // 🎯 TRONG THỰC TẾ, CÓ THỂ BLACKLIST TOKEN Ở ĐÂY
      // Hiện tại chỉ log hành động logout
      
      await AuditLog.create({
        action: 'LOGOUT',
        userId,
        success: true,
        category: 'AUTHENTICATION'
      });

      console.log(`🚪 User logged out: ${userId}`);

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      console.error('❌ Logout error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 REFRESH TOKEN
   */
  async refreshToken(refreshToken) {
    try {
      // 🎯 XÁC THỰC REFRESH TOKEN
      const payload = verifyRefreshToken(refreshToken);
      
      // 🎯 TÌM USER
      const user = await User.findById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 TẠO ACCESS TOKEN MỚI
      const accessToken = signAccessToken(user);

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.create({
        action: 'TOKEN_REFRESH',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        success: true,
        category: 'AUTHENTICATION'
      });

      return {
        accessToken,
        expiresIn: 15 * 60 // 15 phút
      };

    } catch (error) {
      console.error('❌ Refresh token error:', error.message);
      throw new AppError('Refresh token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }
  }

  /**
   * 🎯 ĐĂNG KÝ USER
   */
  async registerUser(userData) {
    try {
      const { email, password, personalInfo, role = 'PATIENT' } = userData;

      // 🎯 KIỂM TRA EMAIL ĐÃ TỒN TẠI
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError('Email đã được sử dụng', 409, ERROR_CODES.DUPLICATE_ENTRY);
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Mật khẩu không đủ mạnh: ${passwordValidation.errors.join(', ')}`,
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 MÃ HÓA MẬT KHẨU
      const hashedPassword = await hashPassword(password);

      // 🎯 TẠO USER MỚI
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        personalInfo,
        status: role === 'PATIENT' ? 'ACTIVE' : 'PENDING_APPROVAL'
      });

      await user.save();

      // 🎯 NẾU LÀ PATIENT, TẠO HỒ SƠ BỆNH NHÂN
      if (role === 'PATIENT') {
        await this.createPatientProfile(user);
      }

      // 🎯 GỬI EMAIL XÁC NHẬN (TÙY CHỌN)
      if (process.env.SEND_WELCOME_EMAIL === 'true') {
        await emailService.sendWelcomeEmail(user);
      }

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG KÝ
      await AuditLog.create({
        action: 'USER_CREATE',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        success: true,
        category: 'USER_MANAGEMENT',
        metadata: { registrationType: 'SELF_REGISTER' }
      });

      console.log(`👤 User registered: ${user.email} (${user.role})`);

      return {
        user: this.sanitizeUser(user),
        message: role === 'PATIENT' 
          ? 'Đăng ký thành công. Bạn có thể đăng nhập ngay.' 
          : 'Đăng ký thành công. Tài khoản đang chờ phê duyệt.'
      };

    } catch (error) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 QUÊN MẬT KHẨU
   */
  async forgotPassword(email) {
    try {
      // 🎯 TÌM USER
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // 🎯 KHÔNG TIẾT LỘ EMAIL CÓ TỒN TẠI HAY KHÔNG
        console.log(`🔒 Password reset requested for non-existent email: ${email}`);
        return { 
          message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến email của bạn' 
        };
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      if (user.status !== 'ACTIVE') {
        throw new AppError(this.getAccountStatusMessage(user.status), 403, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
      }

      // 🎯 TẠO RESET TOKEN
      const resetToken = randomTokenHex(32);
      const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 giờ

      // 🎯 LƯU TOKEN (TRONG THỰC TẾ NÊN LƯU TRONG SEPARATE COLLECTION)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // 🎯 GỬI EMAIL ĐẶT LẠI MẬT KHẨU
      await emailService.sendPasswordResetEmail(user, resetToken);

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.create({
        action: 'PASSWORD_RESET_REQUEST',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        success: true,
        category: 'AUTHENTICATION'
      });

      console.log(`🔑 Password reset requested for: ${user.email}`);

      return { 
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' 
      };

    } catch (error) {
      console.error('❌ Forgot password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐẶT LẠI MẬT KHẨU
   */
  async resetPassword(token, newPassword) {
    try {
      // 🎯 TÌM USER THEO TOKEN
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Mật khẩu không đủ mạnh: ${passwordValidation.errors.join(', ')}`,
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
      await user.save();

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.create({
        action: 'PASSWORD_RESET_SUCCESS',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        success: true,
        category: 'AUTHENTICATION'
      });

      // 🎯 GỬI EMAIL THÔNG BÁO
      await emailService.sendPasswordChangedConfirmation(user);

      console.log(`🔑 Password reset successful for: ${user.email}`);

      return { message: 'Đặt lại mật khẩu thành công' };

    } catch (error) {
      console.error('❌ Reset password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐỔI MẬT KHẨU
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // 🎯 TÌM USER
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Người dùng không tồn tại', 404, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 XÁC THỰC MẬT KHẨU HIỆN TẠI
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        await AuditLog.create({
          action: 'PASSWORD_CHANGE_FAILED',
          userId: user._id,
          userRole: user.role,
          userEmail: user.email,
          success: false,
          category: 'AUTHENTICATION',
          errorMessage: 'Mật khẩu hiện tại không đúng'
        });

        throw new AppError('Mật khẩu hiện tại không đúng', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 KIỂM TRA MẬT KHẨU MỚI KHÁC MẬT KHẨU CŨ
      const isSamePassword = await comparePassword(newPassword, user.password);
      if (isSamePassword) {
        throw new AppError('Mật khẩu mới phải khác mật khẩu hiện tại', 422, ERROR_CODES.VALIDATION_FAILED);
      }

      // 🎯 KIỂM TRA ĐỘ MẠNH MẬT KHẨU
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Mật khẩu không đủ mạnh: ${passwordValidation.errors.join(', ')}`,
          422,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 CẬP NHẬT MẬT KHẨU
      user.password = await hashPassword(newPassword);
      await user.save();

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.create({
        action: 'PASSWORD_CHANGE_SUCCESS',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        success: true,
        category: 'AUTHENTICATION'
      });

      // 🎯 GỬI EMAIL THÔNG BÁO
      await emailService.sendPasswordChangedConfirmation(user);

      console.log(`🔑 Password changed successfully for: ${user.email}`);

      return { message: 'Đổi mật khẩu thành công' };

    } catch (error) {
      console.error('❌ Change password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN USER HIỆN TẠI
   */
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

      if (!user) {
        throw new AppError('Người dùng không tồn tại', 404, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      return this.sanitizeUser(user);

    } catch (error) {
      console.error('❌ Get current user error:', error.message);
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
        bloodType: 'UNKNOWN',
        allergies: [],
        chronicConditions: []
      });

      await patient.save();
      console.log(`🏥 Patient profile created: ${patientId} for user ${user.email}`);

    } catch (error) {
      console.error('❌ Create patient profile error:', error.message);
      // Không throw error để không ảnh hưởng đến quá trình đăng ký
    }
  }

  /**
   * 🎯 LOG FAILED LOGIN ATTEMPT
   */
  async logFailedLoginAttempt(email, ipAddress, reason) {
    try {
      await AuditLog.create({
        action: 'LOGIN_FAILED',
        userEmail: email,
        ipAddress,
        success: false,
        category: 'AUTHENTICATION',
        metadata: { reason }
      });
    } catch (error) {
      console.error('❌ Failed to log failed login attempt:', error.message);
    }
  }

  /**
   * 🎯 SANITIZE USER DATA (LOẠI BỎ THÔNG TIN NHẠY CẢM)
   */
  sanitizeUser(user) {
    const sanitized = { ...user };
    
    // 🎯 LOẠI BỎ CÁC TRƯỜNG NHẠY CẢM
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
      INACTIVE: 'Tài khoản chưa được kích hoạt',
      SUSPENDED: 'Tài khoản đã bị tạm ngưng',
      LOCKED: 'Tài khoản đã bị khóa',
      PENDING_APPROVAL: 'Tài khoản đang chờ phê duyệt',
      EXPIRED: 'Tài khoản đã hết hạn',
    };
    
    return messages[status] || 'Tài khoản không hoạt động';
  }
}

module.exports = new AuthService();