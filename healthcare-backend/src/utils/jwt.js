// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } = require('../config/jwt.config');
const { ROLE_PERMISSIONS } = require('../constants/roles');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');

const JWT_CONFIG = { issuer: 'healthcare-system', audience: 'healthcare-client', algorithm: 'HS256' };
const isDev = process.env.NODE_ENV !== 'production';

function signAccessToken(user) {
  if (!JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET missing');
  if (!user?._id || !user?.email || !user?.role) throw new Error('Invalid user data');

  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    permissions: ROLE_PERMISSIONS[user.role] || [],
    type: 'access'
  };

  const token = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithm: JWT_CONFIG.algorithm
  });

  if (isDev) console.log(`🔐 Access token issued for ${user.email}`);
  return token;
}

function verifyAccessToken(token) {
  if (!token) throw new AppError('Token không được cung cấp', 401, ERROR_CODES.AUTH_INVALID_TOKEN);

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: [JWT_CONFIG.algorithm]
    });

    if (payload.type !== 'access') {
      throw new AppError('Token không phải access token', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token đã hết hạn', 401, ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
    throw new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
  }
}

function signRefreshToken(user) {
  if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET missing');

  const payload = { sub: user._id.toString(), email: user.email, type: 'refresh' };
  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithm: JWT_CONFIG.algorithm
  });

  if (isDev) console.log(`🔄 Refresh token issued for ${user.email}`);
  return token;
}

function verifyRefreshToken(token) {
  if (!token) throw new AppError('Refresh token không được cung cấp', 401, ERROR_CODES.AUTH_INVALID_TOKEN);

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: [JWT_CONFIG.algorithm]
    });

    if (payload.type !== 'refresh') {
      throw new AppError('Token không phải refresh token', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token đã hết hạn', 401, ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
    throw new AppError('Refresh token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
  }
}

function generateTokenPair(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    expiresIn: parseInt(ACCESS_TOKEN_EXPIRES_IN) * 60,
  };
}

function getTokenExpiry(token) {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return 0;
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
}

function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
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