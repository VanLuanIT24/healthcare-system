// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { 
  JWT_ACCESS_SECRET, 
  JWT_REFRESH_SECRET, 
  ACCESS_TOKEN_EXPIRES_IN, 
  REFRESH_TOKEN_EXPIRES_IN 
} = require('../config/jwt.config');
const { ROLE_PERMISSIONS } = require('../constants/roles');

/**
 * 🛡️ TIỆN ÍCH JWT TOKEN 
 * - Tạo và xác thực access/refresh tokens
 * - Quản lý token expiration cơ bản
 */

const JWT_CONFIG = {
  issuer: 'healthcare-system',
  audience: 'healthcare-client',
  algorithm: 'HS256'
};

/**
 * 🎯 TẠO ACCESS TOKEN
 */
function signAccessToken(user) {
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET không được cấu hình');
  }

  if (!user || !user._id || !user.email || !user.role) {
    throw new Error('Thông tin user không đầy đủ để tạo token');
  }

  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: ROLE_PERMISSIONS[user.role] || [],
    type: 'access'
  };

  const options = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithm: JWT_CONFIG.algorithm
  };

  try {
    const token = jwt.sign(payload, JWT_ACCESS_SECRET, options);
    console.log(`🔐 Access token created for: ${user.email} (${user.role})`);
    return token;
  } catch (error) {
    console.error('❌ Lỗi tạo access token:', error.message);
    throw new Error('Không thể tạo access token');
  }
}

/**
 * 🎯 XÁC THỰC ACCESS TOKEN
 */
function verifyAccessToken(token) {
  if (!token) {
    throw new Error('Token không được cung cấp');
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: [JWT_CONFIG.algorithm]
    });

    if (payload.type !== 'access') {
      throw new Error('Token không phải là access token');
    }

    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token không hợp lệ');
    } else {
      throw new Error('Lỗi xác thực token: ' + error.message);
    }
  }
}

/**
 * 🎯 TẠO REFRESH TOKEN
 */
function signRefreshToken(user) {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET không được cấu hình');
  }

  const payload = {
    sub: user._id.toString(),
    email: user.email,
    type: 'refresh'
  };

  const options = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithm: JWT_CONFIG.algorithm
  };

  try {
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, options);
    console.log(`🔄 Refresh token created for: ${user.email}`);
    return token;
  } catch (error) {
    console.error('❌ Lỗi tạo refresh token:', error.message);
    throw new Error('Không thể tạo refresh token');
  }
}

/**
 * 🎯 XÁC THỰC REFRESH TOKEN
 */
function verifyRefreshToken(token) {
  if (!token) {
    throw new Error('Refresh token không được cung cấp');
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: [JWT_CONFIG.algorithm]
    });

    if (payload.type !== 'refresh') {
      throw new Error('Token không phải là refresh token');
    }

    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token đã hết hạn');
    } else {
      throw new Error('Refresh token không hợp lệ: ' + error.message);
    }
  }
}

/**
 * 🎯 TẠO TOKEN PAIR (ACCESS + REFRESH)
 */
function generateTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    expiresIn: getTokenExpiry(accessToken)
  };
}

/**
 * 🎯 KIỂM TRA THỜI GIAN SỐNG CÒN LẠI CỦA TOKEN
 */
function getTokenExpiry(token) {
  const decoded = jwt.decode(token);
  
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - now);
}

/**
 * 🎯 GIẢI MÃ TOKEN (KHÔNG XÁC THỰC)
 */
function decodeToken(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ Lỗi giải mã token:', error.message);
    return null;
  }
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
  getTokenExpiry,
  decodeToken,
  JWT_CONFIG,
};