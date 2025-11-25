// src/config/app.config.js
const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

// =============================================
// CẤU HÌNH ỨNG DỤNG CHÍNH
// =============================================

// 🔹 Load biến môi trường từ file .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// =============================================
// SCHEMA VALIDATION CHO BIẾN MÔI TRƯỜNG
// =============================================
const envSchema = Joi.object({
  // MÔI TRƯỜNG ỨNG DỤNG
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // SERVER CONFIG
  PORT: Joi.number().default(5000),

  // DATABASE
  MONGO_URI: Joi.string()
    .uri()
    .default("mongodb://localhost:27017/healthcare_dev"),

  // JWT CONFIG
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),

  // PASSWORD SECURITY
  SALT_ROUNDS: Joi.number().default(12),

  // EMAIL SERVICE
  EMAIL_FROM: Joi.string().email().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),

  // SECURITY POLICIES
  CORS_ORIGIN: Joi.string().default("*"),
  CSRF_COOKIE_NAME: Joi.string().default("XSRF-TOKEN"),
  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  LOCK_TIME: Joi.string().default("15m"),

  // RATE LIMIT
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // DATABASE CONNECTION POOL
  DB_MAX_POOL_SIZE: Joi.number().default(20),
  DB_MIN_POOL_SIZE: Joi.number().default(5),

  // PERFORMANCE
  REQUEST_TIMEOUT: Joi.number().default(30000),
  JSON_BODY_LIMIT: Joi.string().default("10mb"),

  // SUPER ADMIN
  SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  SUPER_ADMIN_NAME: Joi.string().default("System Root Admin"),

  // HOSPITAL INFO
  HOSPITAL_NAME: Joi.string().default("Healthcare System Hospital"),
  SUPPORT_EMAIL: Joi.string().email().default("support@healthcare.vn"),
  SUPPORT_PHONE: Joi.string().default("+84-28-3829-8149"),

  // LOGGING & AUDIT
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug", "trace")
    .default("info"),
  ENABLE_AUDIT_LOG: Joi.boolean().default(true),
  AUDIT_LOG_RETENTION_DAYS: Joi.number().default(90),

  // FRONTEND / CLIENT URLS
  CLIENT_URL: Joi.string().uri().optional(),
  FRONTEND_URL: Joi.string().uri().optional(),

  // EMAIL FROM NAME (friendly name shown in emails)
  EMAIL_FROM_NAME: Joi.string().optional(),
}).unknown(true);

// =============================================
// ⚙️ VALIDATE & XỬ LÝ LỖI
// =============================================
const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  console.error("❌ Cấu hình môi trường không hợp lệ:\n");
  error.details.forEach((err) => console.error(`- ${err.message}`));
  process.exit(1);
}

// =============================================
// 🧩 TẠO ĐỐI TƯỢNG CẤU HÌNH CHUẨN HOÁ
// =============================================
const appConfig = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  port: env.PORT,

  db: {
    uri: env.MONGO_URI,
    maxPoolSize: env.DB_MAX_POOL_SIZE,
    minPoolSize: env.DB_MIN_POOL_SIZE,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiry: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  cors: {
    // CORS_ORIGIN can be a comma-separated list; normalize to array
    origin: (function parseOrigins(val) {
      if (!val) return ["http://localhost:3000"];
      if (Array.isArray(val)) return val;
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    })(env.CORS_ORIGIN),
  },

  email: {
    from: env.EMAIL_FROM,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    fromName: env.EMAIL_FROM_NAME || env.HOSPITAL_NAME || "Healthcare System",
    clientUrl: env.CLIENT_URL || env.FRONTEND_URL || null,
  },

  security: {
    saltRounds: env.SALT_ROUNDS,
    csrfCookieName: env.CSRF_COOKIE_NAME,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    lockTime: env.LOCK_TIME,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  superAdmin: {
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
    name: env.SUPER_ADMIN_NAME,
    phone: env.SUPER_ADMIN_PHONE,
  },

  hospital: {
    name: env.HOSPITAL_NAME,
    supportEmail: env.SUPPORT_EMAIL,
    supportPhone: env.SUPPORT_PHONE,
  },

  performance: {
    requestTimeout: env.REQUEST_TIMEOUT,
    jsonBodyLimit: env.JSON_BODY_LIMIT,
  },

  logging: {
    level: env.LOG_LEVEL,
    enableAudit: env.ENABLE_AUDIT_LOG,
    retentionDays: env.AUDIT_LOG_RETENTION_DAYS,
  },
};

// Ensure we expose useful process.env fallbacks for other modules (email templates, utils)
try {
  const firstOrigin =
    Array.isArray(appConfig.cors.origin) && appConfig.cors.origin.length > 0
      ? appConfig.cors.origin[0]
      : `http://localhost:${appConfig.port}`;

  process.env.CLIENT_URL =
    process.env.CLIENT_URL || appConfig.email.clientUrl || firstOrigin;
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  process.env.EMAIL_FROM_NAME =
    process.env.EMAIL_FROM_NAME || appConfig.email.fromName;
} catch (e) {
  // ignore
}

// =============================================
// EXPORT
// =============================================
module.exports = {
  ...appConfig,
  config: appConfig,
};
