// src/middlewares/security.middleware.js
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * 🛡️ MIDDLEWARE BẢO MẬT CƠ BẢN
 * - Bảo vệ ứng dụng khỏi các cuộc tấn công phổ biến
 * - Cấu hình tối thiểu nhưng hiệu quả
 */

/**
 * 🎯 CẤU HÌNH HELMET CƠ BẢN
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * 🎯 MIDDLEWARE CHỐNG NO-SQL INJECTION
 */
const noSqlInjectionProtection = mongoSanitize();

/**
 * 🎯 MIDDLEWARE CHỐNG XSS
 */
const xssProtection = xss();

/**
 * 🎯 MIDDLEWARE CHỐNG PARAMETER POLLUTION
 */
const hppProtection = hpp();

/**
 * 🎯 MIDDLEWARE CORS CHO HEALTHCARE
 */
function corsConfig(req, res, next) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA HEADER BẢO MẬT
 */
function securityHeaders(req, res, next) {
  // Các header bảo mật cơ bản
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Ẩn thông tin server
  res.removeHeader('X-Powered-By');
  
  next();
}

/**
 * 🎯 MIDDLEWARE LOG REQUEST
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    console[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
}

module.exports = {
  helmetConfig,
  noSqlInjectionProtection,
  xssProtection,
  hppProtection,
  corsConfig,
  securityHeaders,
  requestLogger,
};