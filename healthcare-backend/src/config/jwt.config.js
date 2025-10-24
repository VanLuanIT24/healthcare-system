// src/config/jwt.config.js
const ms = require('ms');

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('❌ Missing JWT secrets in environment variables');
}

function getAccessExpiryMs() {
  return ms(ACCESS_TOKEN_EXPIRES_IN);
}

function getRefreshExpiryMs() {
  return ms(REFRESH_TOKEN_EXPIRES_IN);
}

module.exports = {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  getAccessExpiryMs,
  getRefreshExpiryMs,
};
