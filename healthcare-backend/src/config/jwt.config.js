// src/config/jwt.config.js
const ms = require('ms');

/**
 * CẤU HÌNH JWT TOKEN CHO HỆ THỐNG
 * Quản lý các tham số cấu hình cho Access Token và Refresh Token
 */

// Lấy giá trị từ biến môi trường, nếu không có thì dùng giá trị mặc định
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Chuyển đổi thời gian hết hạn của Access Token sang mili giây
 * @returns {number} Thời gian hết hạn tính bằng mili giây
 */
function getAccessExpiryMs() {
  return ms(ACCESS_TOKEN_EXPIRES_IN);
}

/**
 * Chuyển đổi thời gian hết hạn của Refresh Token sang mili giây
 * @returns {number} Thời gian hết hạn tính bằng mili giây
 */
function getRefreshExpiryMs() {
  return ms(REFRESH_TOKEN_EXPIRES_IN);
}

// Xuất cấu hình để sử dụng trong toàn hệ thống
module.exports = {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  getAccessExpiryMs,
  getRefreshExpiryMs,
};