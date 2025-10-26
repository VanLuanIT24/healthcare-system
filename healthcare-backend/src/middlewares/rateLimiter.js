// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { AppError, ERROR_CODES } = require('./error.middleware');

/**
 * 🛡️ MIDDLEWARE RATE LIMITING CHO HEALTHCARE SYSTEM
 * - Bảo vệ hệ thống khỏi brute-force attacks
 * - Giới hạn request cho các endpoint quan trọng
 * - Custom message cho healthcare context
 */

/**
 * 🎯 RATE LIMITER CHO ĐĂNG NHẬP
 */
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10), // Tối đa 10 lần
  message: {
    success: false,
    error: {
      code: ERROR_CODES.AUTH_ACCOUNT_LOCKED,
      message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 phút'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ tính failed attempts
  handler: (req, res, next, options) => {
    const error = new AppError(
      options.message.error.message,
      429,
      ERROR_CODES.AUTH_ACCOUNT_LOCKED
    );
    next(error);
  }
});

/**
 * 🎯 RATE LIMITER CHO API CHUNG
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.API_RATE_LIMIT || '300', 10), // 300 requests
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 phút'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🎯 RATE LIMITER CHO TẠO TÀI KHOẢN
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: parseInt(process.env.REGISTER_RATE_LIMIT || '5', 10), // 5 tài khoản/giờ từ 1 IP
  message: {
    success: false,
    error: {
      code: 'REGISTRATION_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu đăng ký từ IP này. Vui lòng thử lại sau 1 giờ.',
      retryAfter: '1 giờ'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🎯 RATE LIMITER CHO QUÊN MẬT KHẨU
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: parseInt(process.env.PASSWORD_RESET_LIMIT || '3', 10), // 3 lần/giờ
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.',
      retryAfter: '1 giờ'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🎯 RATE LIMITER STRICT CHO ADMIN ROUTES
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.ADMIN_RATE_LIMIT || '100', 10), // 100 requests
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu đến khu vực quản trị. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 phút'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 🎯 BỎ QUA RATE LIMIT CHO SUPER ADMIN TRONG MÔI TRƯỜNG DEVELOPMENT
    return process.env.NODE_ENV === 'development' && 
           req.user && 
           req.user.role === 'SUPER_ADMIN';
  }
});

/**
 * 🎯 RATE LIMITER CHO MEDICAL DATA EXPORT
 */
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: parseInt(process.env.EXPORT_RATE_LIMIT || '5', 10), // 5 lần export/giờ
  message: {
    success: false,
    error: {
      code: 'EXPORT_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu xuất dữ liệu. Vui lòng thử lại sau 1 giờ.',
      retryAfter: '1 giờ'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🎯 MIDDLEWARE GHI LOG RATE LIMIT ACTIVITY
 */
function rateLimitLogger(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      console.warn(`⚠️ Rate limit triggered:`, {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        user: req.user ? req.user.email : 'anonymous'
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  loginLimiter,
  apiLimiter,
  registerLimiter,
  passwordResetLimiter,
  adminLimiter,
  exportLimiter,
  rateLimitLogger,
};