// src/config/app.config.js
const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

/**
 * CẤU HÌNH ỨNG DỤNG CHÍNH
 * - Load và validate biến môi trường
 * - Cung cấp cấu hình thống nhất cho toàn bộ ứng dụng
 */

// 🔹 Load biến môi trường từ file .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * SCHEMA VALIDATION CHO BIẾN MÔI TRƯỜNG
 * Đảm bảo tất cả biến môi trường cần thiết được khai báo và hợp lệ
 */
const envSchema = Joi.object({
  // MÔI TRƯỜNG ỨNG DỤNG
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // CẤU HÌNH SERVER
  PORT: Joi.number().default(5000),

  // CƠ SỞ DỮ LIỆU
  MONGO_URI: Joi.string().uri().required(),

  // JWT TOKEN
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  // BẢO MẬT
  SALT_ROUNDS: Joi.number().default(12),

  // EMAIL SERVICE
  EMAIL_FROM: Joi.string().email().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),

  // CORS & SECURITY
  CORS_ORIGIN: Joi.string().default('*'),
  CSRF_COOKIE_NAME: Joi.string().default('XSRF-TOKEN'),
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  LOCK_TIME: Joi.string().default('15m'),

  // SUPER ADMIN ACCOUNT
  SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  SUPER_ADMIN_NAME: Joi.string().default('System Root Admin'),

  // LOGGING & AUDIT
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  ENABLE_AUDIT_LOG: Joi.boolean().default(true),
  AUDIT_LOG_RETENTION_DAYS: Joi.number().default(90),
}).unknown(true); // Cho phép các biến môi trường phụ không xác định

/**
 * VALIDATE VÀ XỬ LÝ LỖI CẤU HÌNH
 */
const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,  // Hiển thị tất cả lỗi, không dừng ở lỗi đầu tiên
  allowUnknown: true, // Cho phép biến không xác định
  stripUnknown: true, // Loại bỏ biến không xác định
});

// 🔴 THOÁT ỨNG DỤNG NẾU CẤU HÌNH KHÔNG HỢP LỆ
if (error) {
  console.error('❌ Cấu hình môi trường không hợp lệ:\n');
  error.details.forEach((err) => console.error(`- ${err.message}`));
  process.exit(1);
}

/**
 * ĐỐI TƯỢNG CẤU HÌNH CHUẨN HÓA
 * Tổ chức cấu hình theo nhóm logic để dễ quản lý
 */
const appConfig = {
  // THÔNG TIN MÔI TRƯỜNG
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  port: env.PORT,

  // CƠ SỞ DỮ LIỆU
  db: {
    uri: env.MONGO_URI,
  },

  // JWT & AUTHENTICATION
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiry: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  // CORS CONFIGURATION
  cors: {
    origin: env.CORS_ORIGIN,
  },

  // EMAIL SERVICE
  email: {
    from: env.EMAIL_FROM,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
  },

  // BẢO MẬT
  security: {
    saltRounds: env.SALT_ROUNDS,
    csrfCookieName: env.CSRF_COOKIE_NAME,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    lockTime: env.LOCK_TIME,
  },

  // TÀI KHOẢN SUPER ADMIN
  superAdmin: {
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
    name: env.SUPER_ADMIN_NAME,
  },

  // LOGGING & AUDIT TRAIL
  logging: {
    level: env.LOG_LEVEL,
    enableAudit: env.ENABLE_AUDIT_LOG,
    retentionDays: env.AUDIT_LOG_RETENTION_DAYS,
  },
};

module.exports = {
  ...appConfig,
  config: appConfig, // Export cả dạng spread và nested object
};