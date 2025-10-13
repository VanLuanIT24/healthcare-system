// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../config/jwt.config');

/**
 * TIỆN ÍCH LÀM VIỆC VỚI JWT TOKEN
 * - Tạo và xác thực access token, refresh token
 * - Xử lý lỗi token chi tiết
 */

/**
 * TẠO ACCESS TOKEN CHO NGƯỜI DÙNG
 * 
 * @param {Object} payload - Dữ liệu đưa vào token
 * @param {string} payload.sub - User ID
 * @param {string} payload.email - Email người dùng
 * @param {string} payload.role - Vai trò người dùng
 * @param {string[]} payload.permissions - Danh sách quyền
 * @returns {string} Access token
 * 
 * @example
 * const token = signAccessToken({
 *   sub: 'user_id',
 *   email: 'user@example.com',
 *   role: 'DOCTOR'
 * });
 */
function signAccessToken(payload) {
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET không được cấu hình');
  }

  const options = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'medauth-api',
    audience: 'medauth-client',
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
}

/**
 * XÁC THỰC ACCESS TOKEN
 * 
 * @param {string} token - JWT token cần xác thực
 * @returns {Object} Payload đã giải mã
 * @throws {Error} Khi token không hợp lệ
 */
function verifyAccessToken(token) {
  if (!token) {
    throw new Error('Token không được cung cấp');
  }

  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'medauth-api',
      audience: 'medauth-client',
    });
  } catch (error) {
    // 🔍 PHÂN LOẠI LỖI CHI TIẾT
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token không hợp lệ');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token chưa có hiệu lực');
    } else {
      throw new Error('Lỗi xác thực token: ' + error.message);
    }
  }
}

/**
 * TẠO REFRESH TOKEN
 * 
 * @param {Object} payload - Dữ liệu đưa vào token
 * @returns {string} Refresh token
 */
function signRefreshToken(payload) {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET không được cấu hình');
  }

  const options = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'medauth-api',
    audience: 'medauth-client',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * XÁC THỰC REFRESH TOKEN
 * 
 * @param {string} token - Refresh token cần xác thực
 * @returns {Object} Payload đã giải mã
 */
function verifyRefreshToken(token) {
  if (!token) {
    throw new Error('Refresh token không được cung cấp');
  }

  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'medauth-api',
      audience: 'medauth-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token đã hết hạn');
    } else {
      throw new Error('Refresh token không hợp lệ: ' + error.message);
    }
  }
}

/**
 * GIẢI MÃ TOKEN MÀ KHÔNG XÁC THỰC CHỮ KÝ
 * (Chỉ sử dụng cho mục đích debug)
 * 
 * @param {string} token - JWT token
 * @returns {Object} Payload đã giải mã
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * KIỂM TRA THỜI GIAN SỐNG CÒN LẠI CỦA TOKEN
 * 
 * @param {string} token - JWT token
 * @returns {number} Thời gian còn lại (giây)
 */
function getTokenExpiry(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - now);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
};