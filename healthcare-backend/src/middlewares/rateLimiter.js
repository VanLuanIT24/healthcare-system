// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * MIDDLEWARE CHỐNG BRUTE-FORCE ATTACK
 * - Giới hạn số lần thử đăng nhập trong khoảng thời gian
 * - Bảo vệ hệ thống khỏi tấn công dò mật khẩu
 */
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 phút
  max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // Tối đa 10 lần
  message: {
    error: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.'
  },
  standardHeaders: true, // Trả về thông tin rate limit trong headers
  legacyHeaders: false,  // Không sử dụng headers cũ
});

module.exports = { loginLimiter };