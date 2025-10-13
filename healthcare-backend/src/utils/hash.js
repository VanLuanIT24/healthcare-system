// src/utils/hash.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const appConfig = require('../config/app.config');

/**
 * TIỆN ÍCH MÃ HÓA VÀ BẢO MẬT
 * - Mã hóa mật khẩu và so sánh
 * - Tạo token ngẫu nhiên
 * - Hash dữ liệu với SHA256
 */

// 🔐 SỐ VÒNG MÃ HÓA BCRYPT (lấy từ cấu hình)
const SALT_ROUNDS = appConfig.security.saltRounds || 12;

/**
 * MÃ HÓA MẬT KHẨU SỬ DỤNG BCRYPT
 * 
 * @param {string} plain - Mật khẩu gốc
 * @returns {Promise<string>} Mật khẩu đã mã hóa
 * 
 * @example
 * const hashedPassword = await hashPassword('password123');
 */
async function hashPassword(plain) {
  if (!plain || plain.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }
  
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * SO SÁNH MẬT KHẨU GỐC VỚI MẬT KHẨU ĐÃ MÃ HÓA
 * 
 * @param {string} plain - Mật khẩu gốc
 * @param {string} hash - Mật khẩu đã mã hóa
 * @returns {Promise<boolean>} Kết quả so sánh
 * 
 * @example
 * const isValid = await comparePassword('password123', storedHash);
 */
async function comparePassword(plain, hash) {
  if (!plain || !hash) {
    return false;
  }
  
  return await bcrypt.compare(plain, hash);
}

/**
 * TẠO TOKEN NGẪU NHIÊN DẠNG HEX
 * 
 * @param {number} size - Kích thước token (bytes)
 * @returns {string} Token ngẫu nhiên
 * 
 * @example
 * const token = randomTokenHex(32); // 64 ký tự hex
 */
function randomTokenHex(size = 48) {
  if (size < 16) {
    throw new Error('Kích thước token phải ít nhất 16 bytes');
  }
  
  return crypto.randomBytes(size).toString('hex');
}

/**
 * TẠO TOKEN NGẪU NHIÊN DẠNG BASE64
 * 
 * @param {number} size - Kích thước token (bytes)
 * @returns {string} Token base64
 */
function randomTokenBase64(size = 32) {
  return crypto.randomBytes(size).toString('base64url');
}

/**
 * MÃ HÓA DỮ LIỆU SỬ DỤNG SHA256
 * 
 * @param {string} data - Dữ liệu cần hash
 * @returns {string} Chuỗi hash SHA256
 * 
 * @example
 * const hash = sha256('secret_data');
 */
function sha256(data) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * MÃ HÓA DỮ LIỆU SỬ DỤNG HMAC-SHA256
 * 
 * @param {string} data - Dữ liệu cần hash
 * @param {string} secret - Secret key
 * @returns {string} Chuỗi HMAC
 */
function hmacSha256(data, secret) {
  return crypto.createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * TẠO MÃ XÁC NHẬN NGẪU NHIÊN (OTP)
 * 
 * @param {number} length - Độ dài mã OTP
 * @returns {string} Mã OTP
 */
function generateOTP(length = 6) {
  if (length < 4 || length > 8) {
    throw new Error('Độ dài OTP phải từ 4 đến 8 ký tự');
  }
  
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

module.exports = {
  hashPassword,
  comparePassword,
  randomTokenHex,
  randomTokenBase64,
  sha256,
  hmacSha256,
  generateOTP,
};