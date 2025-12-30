// src/services/auth.service.js
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Session = require('../models/session.model');
const AuditLog = require('../models/auditLog.model');

const { hashPassword, comparePassword, validatePasswordStrength, randomTokenHex } = require('../utils/hash');
const { generateTokenPair, verifyRefreshToken, signAccessToken } = require('../utils/jwt');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const emailService = require('../utils/email');

class AuthService {
  // Đăng nhập
  async login(email, password, ipAddress, userAgent) {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user) {
      await this.logFailedLogin(email, ipAddress, 'USER_NOT_FOUND');
      throw new AppError('Email hoặc mật khẩu không đúng', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    if (user.status !== 'ACTIVE') {
      await this.logFailedLogin(user.email, ipAddress, 'ACCOUNT_INACTIVE');
      throw new AppError('Tài khoản không hoạt động hoặc đang chờ phê duyệt', 403, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      await this.logFailedLogin(user.email, ipAddress, 'ACCOUNT_LOCKED');
      throw new AppError('Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần', 423, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts?.() || User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } });

      const attemptsLeft = 5 - ((user.loginAttempts || 0) + 1);
      await this.logFailedLogin(user.email, ipAddress, 'INVALID_PASSWORD');

      if (attemptsLeft <= 0) {
        await User.findByIdAndUpdate(user._id, {
          lockUntil: Date.now() + 2 * 60 * 60 * 1000,
          status: 'LOCKED',
        });
        throw new AppError('Tài khoản bị khóa 2 giờ do đăng nhập sai quá nhiều', 423, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
      }

      throw new AppError(`Mật khẩu không đúng. Còn ${attemptsLeft} lần thử`, 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    // Reset login attempts
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lockUntil: null, status: 'ACTIVE' },
      $currentDate: { lastLogin: true },
    });

    const tokens = generateTokenPair(user);
    const session = await this.createSession(user._id, ipAddress, userAgent, tokens.refreshToken);

    await AuditLog.logAction({
      action: 'LOGIN',
      userId: user._id,
      userRole: user.role,
      userEmail: user.email,
      ipAddress,
      userAgent,
      resource: 'User',
      resourceId: user._id,
      success: true,
      category: 'AUTHENTICATION',
      metadata: { sessionId: session._id },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
      sessionId: session._id,
    };
  }

  // Đăng xuất (hỗ trợ nhiều chế độ)
  async logout(userId, refreshToken = null, sessionId = null, excludeSessionId = null) {
    const query = { userId, isActive: true };

    if (excludeSessionId) query._id = { $ne: excludeSessionId };
    else if (sessionId) query._id = sessionId;
    else if (refreshToken) query.refreshToken = refreshToken;

    await Session.updateMany(query, {
      isActive: false,
      logoutAt: new Date(),
      logoutReason: excludeSessionId ? 'LOGOUT_OTHERS' : (sessionId || refreshToken ? 'SINGLE_LOGOUT' : 'FULL_LOGOUT'),
    });

    await AuditLog.logAction({
      action: 'LOGOUT',
      userId,
      success: true,
      category: 'AUTHENTICATION',
      metadata: { type: excludeSessionId ? 'LOGOUT_OTHERS' : 'FULL_LOGOUT' },
    });
  }

  async logoutAll(userId) {
    await this.logout(userId);
  }

  // Làm mới token
  async refreshToken(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);

    if (!user || user.status !== 'ACTIVE' || user.isDeleted) {
      throw new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    const session = await Session.findOne({ userId: user._id, refreshToken, isActive: true });
    if (!session) {
      throw new AppError('Session đã bị thu hồi hoặc không tồn tại', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    await AuditLog.logAction({
      action: 'TOKEN_REFRESH',
      userId: user._id,
      success: true,
      category: 'AUTHENTICATION',
      metadata: { sessionId: session._id },
    });

    return {
      accessToken: signAccessToken(user),
      expiresIn: 15 * 60,
    };
  }

  // Đăng ký người dùng
  async registerUser(userData, ipAddress) {
    const { email, password, personalInfo, role = 'Guest' } = userData;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError('Email đã được sử dụng', 409, ERROR_CODES.DUPLICATE_ENTRY);
    }

    const { isValid, errors } = validatePasswordStrength(password);
    if (!isValid) {
      throw new AppError(`Mật khẩu không đủ mạnh: ${errors.join(', ')}`, 422, ERROR_CODES.VALIDATION_FAILED);
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      personalInfo,
      status: role === 'PATIENT' ? 'ACTIVE' : 'PENDING_APPROVAL',
    });

    await user.save();

    if (role === 'PATIENT') {
      await this.createPatientProfile(user);
    }

    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      emailService.sendWelcomeEmail(user).catch(() => {});
    }

    await AuditLog.logAction({
      action: 'USER_CREATE',
      userId: user._id,
      userRole: user.role,
      userEmail: user.email,
      ipAddress,
      success: true,
      category: 'USER_MANAGEMENT',
      metadata: { registrationType: 'SELF_REGISTER' },
    });

    return {
      user: this.sanitizeUser(user),
      message: role === 'PATIENT'
        ? 'Đăng ký thành công. Bạn có thể đăng nhập ngay.'
        : 'Đăng ký thành công. Tài khoản đang chờ phê duyệt.',
    };
  }

  // Quên mật khẩu
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user || user.status !== 'ACTIVE') {
      return { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn' };
    }

    const resetToken = randomTokenHex(32);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      // Không throw lỗi để tránh lộ thông tin
    }

    await AuditLog.logAction({
      action: 'PASSWORD_RESET_REQUEST',
      userId: user._id,
      success: true,
      category: 'AUTHENTICATION',
    });

    return { message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' };
  }

  // Đặt lại mật khẩu
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user) {
      throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    const { isValid, errors } = validatePasswordStrength(newPassword);
    if (!isValid) {
      throw new AppError(`Mật khẩu không đủ mạnh: ${errors.join(', ')}`, 422, ERROR_CODES.VALIDATION_FAILED);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.status = 'ACTIVE';
    await user.save();

    // Đóng tất cả session cũ
    await Session.updateMany({ userId: user._id, isActive: true }, {
      isActive: false,
      logoutAt: new Date(),
      logoutReason: 'PASSWORD_RESET',
    });

    try {
      await emailService.sendPasswordChangedConfirmation(user);
    } catch (error) {}

    await AuditLog.logAction({
      action: 'PASSWORD_RESET_SUCCESS',
      userId: user._id,
      success: true,
      category: 'AUTHENTICATION',
    });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  // Đổi mật khẩu (khi đã đăng nhập)
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Người dùng không tồn tại', 404);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      await AuditLog.logAction({ action: 'PASSWORD_CHANGE_FAILED', userId, success: false, errorMessage: 'Mật khẩu hiện tại sai' });
      throw new AppError('Mật khẩu hiện tại không đúng', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    const isSame = await comparePassword(newPassword, user.password);
    if (isSame) {
      throw new AppError('Mật khẩu mới phải khác mật khẩu cũ', 422, ERROR_CODES.VALIDATION_FAILED);
    }

    const { isValid: strong, errors } = validatePasswordStrength(newPassword);
    if (!strong) {
      throw new AppError(`Mật khẩu không đủ mạnh: ${errors.join(', ')}`, 422, ERROR_CODES.VALIDATION_FAILED);
    }

    user.password = newPassword;
    await user.save();

    // Đóng tất cả session
    await Session.updateMany({ userId: user._id, isActive: true }, {
      isActive: false,
      logoutAt: new Date(),
      logoutReason: 'PASSWORD_CHANGE',
    });

    try {
      await emailService.sendPasswordChangedConfirmation(user);
    } catch (error) {}

    await AuditLog.logAction({
      action: 'PASSWORD_CHANGE_SUCCESS',
      userId,
      success: true,
      category: 'AUTHENTICATION',
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(userId) {
    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) throw new AppError('Người dùng không tồn tại', 404);
    return this.sanitizeUser(user);
  }

  // Lấy danh sách session
  async getUserSessions(userId) {
    return await Session.find({ userId })
      .sort({ loginAt: -1 })
      .select('ipAddress userAgent loginAt logoutAt isActive lastActivity logoutReason')
      .lean();
  }

  // Thu hồi session cụ thể
  async revokeSession(sessionId, userId) {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) throw new AppError('Session không tồn tại', 404);
    if (!session.isActive) throw new AppError('Session đã bị thu hồi trước đó', 400);

    session.isActive = false;
    session.logoutAt = new Date();
    session.logoutReason = 'MANUALLY_REVOKED';
    await session.save();

    await AuditLog.logAction({
      action: 'SESSION_REVOKED',
      userId,
      resource: 'Session',
      resourceId: sessionId,
      success: true,
      category: 'AUTHENTICATION',
    });
  }

  // Xác thực email (token từ params)
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user) {
      throw new AppError('Token xác thực không hợp lệ hoặc đã hết hạn', 400, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      emailService.sendWelcomeEmail(user).catch(() => {});
    }

    await AuditLog.logAction({
      action: 'EMAIL_VERIFIED',
      userId: user._id,
      success: true,
      category: 'AUTHENTICATION',
    });

    return {
      message: 'Xác thực email thành công',
      user: this.sanitizeUser(user),
    };
  }

  // Gửi lại email xác thực
  async resendVerification(email) {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user) {
      return { message: 'Nếu email tồn tại, email xác thực sẽ được gửi lại' };
    }

    if (user.isEmailVerified) {
      throw new AppError('Email đã được xác thực trước đó', 400);
    }

    const token = user.generateEmailVerificationToken();
    await user.save();

    try {
      await emailService.sendVerificationEmail(user, token);
    } catch (error) {}

    return { message: 'Email xác thực đã được gửi lại' };
  }

  // Hàm hỗ trợ
  async createSession(userId, ipAddress, userAgent, refreshToken) {
    const session = new Session({
      userId,
      ipAddress,
      userAgent,
      refreshToken,
      loginAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    });
    await session.save();
    return session;
  }

  async createPatientProfile(user) {
    const patientId = `PAT${Date.now().toString().slice(-8)}`;
    const patient = new Patient({ 
      userId: user._id, 
      patientId,
      createdBy: user._id  // ✅ Set createdBy to the newly created user
    });
    await patient.save();
  }

  sanitizeUser(user) {
    const obj = user.toObject ? user.toObject() : user;
    const { password, resetPasswordToken, resetPasswordExpires, emailVerificationToken, emailVerificationExpires, __v, ...safe } = obj;
    return safe;
  }

  async logFailedLogin(email, ipAddress, reason) {
    await AuditLog.logAction({
      action: 'LOGIN_FAILED',
      userEmail: email,
      ipAddress,
      success: false,
      category: 'AUTHENTICATION',
      metadata: { reason },
    }).catch(() => {});
  }
}

module.exports = new AuthService();