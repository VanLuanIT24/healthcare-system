const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const AuditLog = require('../models/auditLog.model');
const Session = require('../models/session.model'); // Thêm model session mới
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
 * 🛡️ AUTHENTICATION SERVICE CHO HEALTHCARE SYSTEM - HOÀN THIỆN
 */

class AuthService {
  /**
   * 🎯 ĐĂNG NHẬP - HOÀN THIỆN
   */
  async login(email, password, ipAddress, userAgent) {
    try {
      console.log('🔐 [AUTH SERVICE] Login attempt:', { email, ipAddress });

      // 🎯 TÌM USER THEO EMAIL
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        await this.logFailedLoginAttempt(email, ipAddress, 'USER_NOT_FOUND');
        throw new AppError('Email hoặc mật khẩu không đúng', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      const userStatus = user.status || 'ACTIVE';
      
      if (userStatus !== 'ACTIVE') {
        await this.logFailedLoginAttempt(user.email, ipAddress, 'ACCOUNT_INACTIVE');
        throw new AppError(this.getAccountStatusMessage(userStatus), 403, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
      }

      // 🎯 KIỂM TRA TÀI KHOẢN BỊ KHÓA
      if (user.lockUntil && user.lockUntil > Date.now()) {
        await this.logFailedLoginAttempt(user.email, ipAddress, 'ACCOUNT_LOCKED');
        throw new AppError(
          'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 2 giờ.',
          423,
          ERROR_CODES.AUTH_ACCOUNT_LOCKED
        );
      }

      // 🎯 XÁC THỰC MẬT KHẨU
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        // Xử lý increment login attempts
        try {
          if (typeof user.incrementLoginAttempts === 'function') {
            await user.incrementLoginAttempts();
          } else {
            await User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } });
          }
        } catch (updateError) {
          console.error('❌ Error updating login attempts:', updateError.message);
        }

        await this.logFailedLoginAttempt(user.email, ipAddress, 'INVALID_PASSWORD');
        
        const currentAttempts = (user.loginAttempts || 0) + 1;
        const attemptsLeft = 5 - currentAttempts;
        
        if (attemptsLeft > 0) {
          throw new AppError(
            `Mật khẩu không đúng. Còn ${attemptsLeft} lần thử.`, 
            401, 
            ERROR_CODES.AUTH_INVALID_CREDENTIALS
          );
        } else {
          await User.findByIdAndUpdate(user._id, {
            $set: { 
              lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
              status: 'LOCKED'
            }
          });
          
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
          lockUntil: null,
          status: 'ACTIVE'
        },
        $currentDate: { 
          lastLogin: true 
        }
      });

      // 🎯 TẠO TOKENS
      const tokens = generateTokenPair(user);

      // 🎯 TẠO SESSION MỚI
      const session = await this.createSession(user._id, ipAddress, userAgent, tokens.refreshToken);

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG NHẬP THÀNH CÔNG
      await AuditLog.logAction({
        action: 'LOGIN',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        ipAddress,
        userAgent,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'AUTHENTICATION',
        metadata: { sessionId: session._id }
      });

      console.log(`✅ User logged in successfully: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        tokens,
        sessionId: session._id
      };

    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐĂNG XUẤT - HOÀN THIỆN
   */
  async logout(userId, refreshToken = null, sessionId = null) {
    try {
      // 🎯 NẾU CÓ SESSION ID, ĐÓNG SESSION ĐÓ
      if (sessionId) {
        await this.revokeSession(sessionId);
      } 
      // 🎯 NẾU CÓ REFRESH TOKEN, TÌM VÀ ĐÓNG SESSION
      else if (refreshToken) {
        await Session.findOneAndUpdate(
          { userId, refreshToken, isActive: true },
          { 
            isActive: false,
            logoutAt: new Date()
          }
        );
      }
      // 🎯 NẾU KHÔNG CÓ THÔNG TIN, ĐÓNG TẤT CẢ SESSION CỦA USER
      else if (userId) {
        await Session.updateMany(
          { userId, isActive: true },
          { 
            isActive: false,
            logoutAt: new Date()
          }
        );
      }

      await AuditLog.logAction({
        action: 'LOGOUT',
        userId,
        resource: 'User',
        resourceId: userId,
        success: true,
        category: 'AUTHENTICATION',
        metadata: { sessionId, logoutType: refreshToken ? 'TOKEN_LOGOUT' : 'FULL_LOGOUT' }
      });

      console.log(`✅ User logged out: ${userId}`);
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      console.error('❌ Logout error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 REFRESH TOKEN - HOÀN THIỆN
   */
  async refreshToken(refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      const user = await User.findById(payload.sub);
      if (!user || (user.status && user.status !== 'ACTIVE')) {
        throw new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 KIỂM TRA SESSION CÓ TỒN TẠI VÀ ACTIVE
      const session = await Session.findOne({
        userId: user._id,
        refreshToken,
        isActive: true
      });

      if (!session) {
        throw new AppError('Session không tồn tại hoặc đã bị thu hồi', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      const accessToken = signAccessToken(user);

      await AuditLog.logAction({
        action: 'TOKEN_REFRESH',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'AUTHENTICATION',
        metadata: { sessionId: session._id }
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
   * 🎯 ĐĂNG KÝ USER - HOÀN THIỆN
   */
  async registerUser(userData, ipAddress = '0.0.0.0') {
    try {
      const { email, password, personalInfo, role = 'PATIENT' } = userData;

      console.log('👤 [AUTH SERVICE] Starting user registration:', { email });

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

      // 🎯 TẠO USER MỚI
      const user = new User({
        email: email.toLowerCase(),
        password: password,
        role,
        personalInfo,
        status: role === 'PATIENT' ? 'ACTIVE' : 'PENDING_APPROVAL'
      });

      await user.save();
      console.log('✅ User saved successfully');

      // 🎯 NẾU LÀ PATIENT, TẠO HỒ SƠ BỆNH NHÂN
      if (role === 'PATIENT') {
        await this.createPatientProfile(user);
      }

      // 🎯 GỬI EMAIL CHÀO MỪNG
      if (process.env.SEND_WELCOME_EMAIL === 'true') {
        try {
          await emailService.sendWelcomeEmail(user);
          console.log('✅ Welcome email sent successfully');
        } catch (emailError) {
          console.error('❌ Welcome email failed, but user was created:', emailError.message);
        }
      }

      // 🎯 LOG HOẠT ĐỘNG ĐĂNG KÝ
      await AuditLog.logAction({
        action: 'USER_CREATE',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        userName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        ipAddress: ipAddress,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'USER_MANAGEMENT',
        metadata: { registrationType: 'SELF_REGISTER' }
      });

      console.log(`✅ User registered: ${user.email}`);

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
   * 🎯 QUÊN MẬT KHẨU - HOÀN THIỆN
   */
  async forgotPassword(email) {
    try {
      console.log('🔑 [AUTH SERVICE] Forgot password request:', { email });

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

      // 🎯 LƯU TOKEN
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // 🎯 GỬI EMAIL ĐẶT LẠI MẬT KHẨU
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('❌ Password reset email failed:', emailError.message);
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: 'PASSWORD_RESET_REQUEST',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'AUTHENTICATION'
      });

      return { 
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' 
      };

    } catch (error) {
      console.error('❌ Forgot password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐẶT LẠI MẬT KHẨU - HOÀN THIỆN
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('🔑 [AUTH SERVICE] Reset password attempt with token');

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
      user.status = 'ACTIVE';
      await user.save();

      // 🎯 ĐÓNG TẤT CẢ SESSION CŨ (FORCE LOGOUT)
      await Session.updateMany(
        { userId: user._id, isActive: true },
        { 
          isActive: false,
          logoutAt: new Date(),
          logoutReason: 'PASSWORD_RESET'
        }
      );

      // 🎯 GỬI EMAIL THÔNG BÁO
      try {
        await emailService.sendPasswordChangedConfirmation(user);
        console.log(`✅ Password changed confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error('❌ Password changed email failed:', emailError.message);
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: 'PASSWORD_RESET_SUCCESS',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'AUTHENTICATION'
      });

      console.log(`✅ Password reset successful for: ${user.email}`);

      return { message: 'Đặt lại mật khẩu thành công' };

    } catch (error) {
      console.error('❌ Reset password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 ĐỔI MẬT KHẨU - HOÀN THIỆN
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Người dùng không tồn tại', 404, ERROR_CODES.AUTH_INVALID_TOKEN);
      }

      // 🎯 XÁC THỰC MẬT KHẨU HIỆN TẠI
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        await AuditLog.logAction({
          action: 'PASSWORD_CHANGE_FAILED',
          userId: user._id,
          userRole: user.role,
          userEmail: user.email,
          resource: 'User',
          resourceId: user._id,
          success: false,
          category: 'AUTHENTICATION',
          errorMessage: 'Mật khẩu hiện tại không đúng'
        });

        throw new AppError('Mật khẩu hiện tại không đúng', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
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

      // 🎯 ĐÓNG TẤT CẢ SESSION CŨ (FORCE LOGOUT)
      await Session.updateMany(
        { userId: user._id, isActive: true },
        { 
          isActive: false,
          logoutAt: new Date(),
          logoutReason: 'PASSWORD_CHANGE'
        }
      );

      // 🎯 GỬI EMAIL THÔNG BÁO
      try {
        await emailService.sendPasswordChangedConfirmation(user);
        console.log(`✅ Password changed confirmation sent to: ${user.email}`);
      } catch (emailError) {
        console.error('❌ Password changed email failed:', emailError.message);
      }

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: 'PASSWORD_CHANGE_SUCCESS',
        userId: user._id,
        userRole: user.role,
        userEmail: user.email,
        resource: 'User',
        resourceId: user._id,
        success: true,
        category: 'AUTHENTICATION'
      });

      console.log(`✅ Password changed successfully for: ${user.email}`);

      return { message: 'Đổi mật khẩu thành công' };

    } catch (error) {
      console.error('❌ Change password error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN USER HIỆN TẠI - HOÀN THIỆN
   */
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil')
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
   * 🎯 LẤY TẤT CẢ SESSION CỦA USER - HÀM MỚI
   */
  async getUserSessions(userId) {
    try {
      const sessions = await Session.find({ userId })
        .sort({ loginAt: -1 })
        .lean();

      return sessions.map(session => ({
        sessionId: session._id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        loginAt: session.loginAt,
        logoutAt: session.logoutAt,
        isActive: session.isActive,
        lastActivity: session.lastActivity,
        logoutReason: session.logoutReason
      }));

    } catch (error) {
      console.error('❌ Get user sessions error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 THU HỒI SESSION - HÀM MỚI
   */
  async revokeSession(sessionId) {
    try {
      const session = await Session.findById(sessionId);
      
      if (!session) {
        throw new AppError('Session không tồn tại', 404);
      }

      if (!session.isActive) {
        throw new AppError('Session đã bị thu hồi trước đó', 400);
      }

      session.isActive = false;
      session.logoutAt = new Date();
      session.logoutReason = 'MANUALLY_REVOKED';
      await session.save();

      // 🎯 LOG HOẠT ĐỘNG
      await AuditLog.logAction({
        action: 'SESSION_REVOKED',
        userId: session.userId,
        resource: 'Session',
        resourceId: session._id,
        success: true,
        category: 'AUTHENTICATION',
        metadata: { sessionId: session._id }
      });

      console.log(`✅ Session revoked: ${sessionId}`);

      return { message: 'Session đã được thu hồi thành công' };

    } catch (error) {
      console.error('❌ Revoke session error:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO SESSION MỚI - HÀM HỖ TRỢ
   */
  async createSession(userId, ipAddress, userAgent, refreshToken) {
    try {
      const session = new Session({
        userId,
        ipAddress,
        userAgent,
        refreshToken,
        loginAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('❌ Create session error:', error.message);
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
      console.log(`✅ Patient profile created: ${patientId}`);

    } catch (error) {
      console.error('❌ Create patient profile error:', error.message);
    }
  }

  /**
   * 🎯 LOG FAILED LOGIN ATTEMPT
   */
  async logFailedLoginAttempt(email, ipAddress, reason) {
    try {
      await AuditLog.logAction({
        action: 'LOGIN_FAILED',
        userEmail: email,
        ipAddress,
        resource: 'User',
        success: false,
        category: 'AUTHENTICATION',
        metadata: { reason }
      });
    } catch (error) {
      console.error('❌ Failed to log failed login attempt:', error.message);
    }
  }

  /**
   * 🎯 SANITIZE USER DATA
   */
  sanitizeUser(user) {
    // Convert Mongoose document to plain object
    const userObj = user.toObject ? user.toObject() : user;
    
    const sanitized = {
      _id: userObj._id,
      email: userObj.email,
      role: userObj.role,
      personalInfo: userObj.personalInfo,
      department: userObj.department,
      specialization: userObj.specialization,
      professionalInfo: userObj.professionalInfo,
      contactInfo: userObj.contactInfo,
      status: userObj.status,
      isEmailVerified: userObj.isEmailVerified,
      permissions: userObj.permissions,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };

    return sanitized;
  }

  /**
   * 🎯 THÔNG BÁO TRẠNG THÁI TÀI KHOẢN
   */
  getAccountStatusMessage(status) {
    const messages = {
      'ACTIVE': 'Tài khoản đang hoạt động',
      'INACTIVE': 'Tài khoản chưa được kích hoạt',
      'SUSPENDED': 'Tài khoản đã bị tạm ngưng',
      'LOCKED': 'Tài khoản đã bị khóa',
      'PENDING_APPROVAL': 'Tài khoản đang chờ phê duyệt',
    };
    
    return messages[status] || 'Tài khoản không hoạt động';
  }

  /**
 * 🎯 VERIFY EMAIL - HÀM MỚI
 */
async verifyEmail(token) {
  try {
    console.log('📧 [AUTH SERVICE] Verifying email with token');

    const user = await User.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Token xác thực email không hợp lệ hoặc đã hết hạn', 400, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    // Xác thực email
    user.verifyEmail();
    await user.save();

    // Gửi email chào mừng
    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      try {
        await emailService.sendWelcomeEmail(user);
        console.log(`✅ Welcome email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('❌ Welcome email failed:', emailError.message);
      }
    }

    // Log hoạt động
    await AuditLog.logAction({
      action: 'EMAIL_VERIFIED',
      userId: user._id,
      userRole: user.role,
      userEmail: user.email,
      resource: 'User',
      resourceId: user._id,
      success: true,
      category: 'AUTHENTICATION'
    });

    console.log(`✅ Email verified successfully for: ${user.email}`);

    return {
      message: 'Email đã được xác thực thành công',
      user: this.sanitizeUser(user)
    };

  } catch (error) {
    console.error('❌ Verify email error:', error.message);
    throw error;
  }
}

/**
 * 🎯 RESEND VERIFICATION EMAIL - HÀM MỚI
 */
async resendVerification(email) {
  try {
    console.log('📧 [AUTH SERVICE] Resending verification email:', email);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Không tiết lộ email có tồn tại
      return { 
        message: 'Nếu email tồn tại, email xác thực sẽ được gửi lại' 
      };
    }

    if (user.isEmailVerified) {
      throw new AppError('Email đã được xác thực', 400);
    }

    // Tạo token mới
    const newToken = user.generateEmailVerificationToken();
    await user.save();

    // Gửi email xác thực
    try {
      await emailService.sendVerificationEmail(user, newToken);
      console.log(`✅ Verification email resent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Verification email failed:', emailError.message);
    }

    return { 
      message: 'Email xác thực đã được gửi lại' 
    };

  } catch (error) {
    console.error('❌ Resend verification error:', error.message);
    throw error;
  }
}
}

module.exports = new AuthService();