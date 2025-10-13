// src/services/auth.service.js
const ms = require('ms');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { hashPassword, comparePassword, randomTokenHex, sha256 } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');
const { appConfig } = require('../config');
const { log } = require('./audit.service');
const speakeasy = require('speakeasy');
const { getRefreshExpiryMs } = require('../config/jwt.config');

/**
 * DỊCH VỤ XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG
 * - Xử lý logic đăng ký, đăng nhập, quản lý token
 * - Hỗ trợ xác thực 2 yếu tố (2FA)
 */

/**
 * TẠO REFRESH TOKEN MỚI CHO USER
 * 
 * @param {string} userId - ID người dùng
 * @param {Object} options - Thông tin bổ sung
 * @param {string} options.ip - Địa chỉ IP
 * @param {string} options.device - Thông tin thiết bị
 * @returns {Promise<string>} Raw refresh token
 */
async function createRefreshToken(userId, { ip, device }) {
  const raw = randomTokenHex(48); // Tạo token ngẫu nhiên
  const hash = sha256(raw); // Mã hóa token để lưu trữ
  const expiresAt = new Date(Date.now() + getRefreshExpiryMs());
  
  await RefreshToken.create({
    user: userId,
    tokenHash: hash,
    ip,
    device,
    expiresAt,
  });
  
  return raw; // Trả về raw token (chỉ gửi cho client)
}

/**
 * XOAY VÒNG REFRESH TOKEN (TOKEN ROTATION)
 * - Vô hiệu hóa token cũ, tạo token mới
 * - Tăng cường bảo mật
 * 
 * @param {string} oldTokenRaw - Refresh token cũ
 * @param {string} userId - ID người dùng
 * @param {Object} opts - Tùy chọn
 * @returns {Promise<string>} Refresh token mới
 */
async function rotateRefreshToken(oldTokenRaw, userId, opts) {
  const oldHash = sha256(oldTokenRaw);
  const tokenRec = await RefreshToken.findOne({ 
    user: userId, 
    tokenHash: oldHash 
  });

  // 🔒 KIỂM TRA TOKEN HỢP LỆ
  if (!tokenRec || tokenRec.revoked) {
    // VÔ HIỆU HÓA TẤT CẢ TOKEN CỦA USER NẾU PHÁT HIỆN BẤT THƯỜNG
    await RefreshToken.updateMany({ user: userId }, { revoked: true });
    throw new Error('Refresh token không hợp lệ hoặc đã bị thu hồi');
  }

  // 🗑️ ĐÁNH DẤU TOKEN CŨ ĐÃ BỊ THU HỒI
  tokenRec.revoked = true;
  const newRaw = randomTokenHex(48);
  const newHash = sha256(newRaw);
  tokenRec.replacedBy = newHash;
  await tokenRec.save();

  // 🆕 TẠO TOKEN MỚI
  const expiresAt = new Date(Date.now() + getRefreshExpiryMs());
  await RefreshToken.create({
    user: userId,
    tokenHash: newHash,
    ip: opts.ip,
    device: opts.device,
    expiresAt,
  });

  return newRaw;
}

/**
 * ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG MỚI
 * 
 * @param {Object} userData - Thông tin đăng ký
 * @returns {Promise<Object>} User object
 */
async function registerUser({ email, name, password, role, creatorId, ip, userAgent }) {
  // 🔍 KIỂM TRA EMAIL ĐÃ TỒN TẠI
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error('Email đã được sử dụng');
  }

  // 🔐 MÃ HÓA MẬT KHẨU
  const pwdHash = await hashPassword(password);
  
  // 🎯 XÁC ĐỊNH QUYỀN ĐƯỢC TẠO USER
  const canCreate = (() => {
    switch (role) {
      case 'SUPER_ADMIN':
        return ['ADMIN', 'MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'];
      case 'ADMIN':
        return ['MANAGER', 'DOCTOR', 'STAFF', 'PATIENT'];
      case 'MANAGER':
        return ['DOCTOR', 'STAFF'];
      default:
        return [];
    }
  })();

  // 📝 TẠO USER MỚI
  const user = new User({
    email,
    name,
    passwordHash: pwdHash,
    role: role || 'PATIENT',
    canCreate,
    createdBy: creatorId || null,
    status: 'ACTIVE', // Kích hoạt ngay nếu được admin tạo
  });

  await user.save();
  
  // 📊 GHI AUDIT LOG
  await log(creatorId, 'REGISTER_USER', { 
    target: user._id, 
    ip, 
    userAgent, 
    meta: { role } 
  });
  
  return user;
}

/**
 * ĐĂNG NHẬP HỆ THỐNG
 * 
 * @param {Object} credentials - Thông tin đăng nhập
 * @returns {Promise<Object>} Kết quả đăng nhập
 */
async function login({ email, password, ip, userAgent, twoFACode }) {
  // 🔍 TÌM USER THEO EMAIL
  const user = await User.findOne({ email });
  if (!user) {
    await log(null, 'LOGIN_FAILED', { meta: { email }, ip, userAgent });
    throw new Error('Thông tin đăng nhập không chính xác');
  }

  // 🔒 KIỂM TRA TÀI KHOẢN BỊ KHÓA
  if (user.isLocked) {
    await log(user._id, 'LOGIN_LOCKED', { ip, userAgent });
    throw new Error('Tài khoản đã bị khóa do đăng nhập sai nhiều lần');
  }

  // 🔒 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
  if (user.status !== 'ACTIVE') {
    await log(user._id, 'LOGIN_INACTIVE', { ip, userAgent });
    throw new Error('Tài khoản không hoạt động');
  }

  // 🔐 XÁC THỰC MẬT KHẨU
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    // ➕ TĂNG SỐ LẦN ĐĂNG NHẬP SAI
    user.failedLoginAttempts += 1;
    
    // 🔒 KHÓA TÀI KHOẢN NẾU VƯỢT QUÁ SỐ LẦN CHO PHÉP
    if (user.failedLoginAttempts >= appConfig.security.maxLoginAttempts) {
      user.lockUntil = new Date(Date.now() + ms(appConfig.security.lockTime));
      await log(user._id, 'ACCOUNT_LOCKED', { ip, userAgent });
    }
    
    await user.save();
    await log(user._id, 'LOGIN_FAILED', { ip, userAgent });
    throw new Error('Thông tin đăng nhập không chính xác');
  }

  // 🔐 XÁC THỰC 2 YẾU TỐ (2FA)
  if (user.twoFA && user.twoFA.enabled) {
    if (!twoFACode) {
      throw new Error('Yêu cầu mã xác thực 2 yếu tố');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFA.secret,
      encoding: 'base32',
      token: twoFACode,
      window: 1, // Cho phép sai số thời gian
    });

    if (!verified) {
      await log(user._id, 'LOGIN_2FA_FAILED', { ip, userAgent });
      throw new Error('Mã xác thực 2 yếu tố không hợp lệ');
    }
  }

  // 🔄 RESET TRẠNG THÁI ĐĂNG NHẬP SAI
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = { ip, userAgent, at: new Date() };
  await user.save();

  // 🎫 TẠO ACCESS TOKEN & REFRESH TOKEN
  const payload = { 
    sub: user._id, 
    email: user.email, 
    role: user.role, 
    permissions: user.canCreate || [] 
  };
  const accessToken = signAccessToken(payload);
  const refreshRaw = await createRefreshToken(user._id, { ip, device: userAgent });

  // 📊 GHI LOG ĐĂNG NHẬP THÀNH CÔNG
  await log(user._id, 'LOGIN_SUCCESS', { ip, userAgent });
  
  return { 
    user, 
    accessToken, 
    refreshToken: refreshRaw 
  };
}

/**
 * ĐĂNG XUẤT HỆ THỐNG
 * 
 * @param {string} userId - ID người dùng
 * @param {string} refreshTokenRaw - Refresh token cần thu hồi
 */
async function logout(userId, refreshTokenRaw) {
  try {
    // 🗑️ THU HỒI REFRESH TOKEN
    if (refreshTokenRaw) {
      const hash = sha256(refreshTokenRaw);
      await RefreshToken.updateOne({ 
        user: userId, 
        tokenHash: hash 
      }, { 
        revoked: true 
      });
    }
    
    // 📊 GHI AUDIT LOG
    await log(userId, 'LOGOUT', {});
  } catch (err) {
    console.error('❌ Lỗi đăng xuất:', err);
    // Không throw error để không ảnh hưởng user experience
  }
}

/**
 * LÀM MỚI ACCESS TOKEN BẰNG REFRESH TOKEN
 * 
 * @param {string} refreshTokenRaw - Refresh token hiện tại
 * @param {string} ip - Địa chỉ IP
 * @param {string} device - Thông tin thiết bị
 * @returns {Promise<Object>} Tokens mới
 */
async function refreshTokens(refreshTokenRaw, ip, device) {
  const hash = sha256(refreshTokenRaw);
  const tokenRec = await RefreshToken.findOne({ tokenHash: hash });

  // 🔒 KIỂM TRA TOKEN HỢP LỆ
  if (!tokenRec || tokenRec.revoked || tokenRec.expiresAt < new Date()) {
    // VÔ HIỆU HÓA TẤT CẢ TOKEN NẾU PHÁT HIỆN BẤT THƯỜNG
    if (tokenRec) {
      await RefreshToken.updateMany({ user: tokenRec.user }, { revoked: true });
    }
    throw new Error('Refresh token không hợp lệ');
  }

  // 🔍 TÌM USER TƯƠNG ỨNG
  const user = await User.findById(tokenRec.user);
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  // 🔄 XOAY VÒNG TOKEN
  const newRaw = await rotateRefreshToken(refreshTokenRaw, user._id, { ip, device });
  
  // 🎫 TẠO ACCESS TOKEN MỚI
  const payload = { 
    sub: user._id, 
    email: user.email, 
    role: user.role, 
    permissions: user.canCreate || [] 
  };
  const accessToken = signAccessToken(payload);

  // 📊 GHI AUDIT LOG
  await log(user._id, 'REFRESH_TOKEN', { ip, userAgent: device });
  
  return { 
    accessToken, 
    refreshToken: newRaw 
  };
}

/**
 * SINH SECRET KEY CHO XÁC THỰC 2 YẾU TỐ
 * 
 * @returns {Object} Secret information
 */
function generate2FASecret() {
  const secret = speakeasy.generateSecret({ 
    length: 20,
    name: `MediAuth (${process.env.APP_NAME || 'System'})` // Tên app trong authenticator
  });
  
  return { 
    otpauth_url: secret.otpauth_url, 
    base32: secret.base32 
  };
}

/**
 * KÍCH HOẠT XÁC THỰC 2 YẾU TỐ CHO USER
 * 
 * @param {string} userId - ID người dùng
 * @param {string} base32Secret - Secret key base32
 * @returns {Promise<Object>} User object
 */
async function enable2FAForUser(userId, base32Secret) {
  const user = await User.findById(userId);
  user.twoFA = { 
    enabled: true, 
    secret: base32Secret 
  };
  await user.save();
  
  await log(userId, 'ENABLE_2FA');
  return user;
}

/**
 * VÔ HIỆU HÓA XÁC THỰC 2 YẾU TỐ
 * 
 * @param {string} userId - ID người dùng
 * @returns {Promise<Object>} User object
 */
async function disable2FAForUser(userId) {
  const user = await User.findById(userId);
  user.twoFA = { 
    enabled: false, 
    secret: null  // Xóa secret để bảo mật
  };
  await user.save();
  
  await log(userId, 'DISABLE_2FA');
  return user;
}

module.exports = {
  registerUser,
  login,
  logout,
  refreshTokens,
  createRefreshToken,
  rotateRefreshToken,
  generate2FASecret,
  enable2FAForUser,
  disable2FAForUser,
};