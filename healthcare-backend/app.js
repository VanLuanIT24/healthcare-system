// src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { appConfig } = require('./src/config');
const authRoutes = require('./src/routes/auth.routes');

const superAdminRoutes = require('../healthcare-backend/src/routes/superAdmin.routes');

/**
 * ỨNG DỤNG EXPRESS CHÍNH
 * - Cấu hình middleware bảo mật và hiệu năng
 * - Định tuyến API endpoints
 */

// 🚀 KHỞI TẠO ỨNG DỤNG EXPRESS
const app = express();

// 🔒 MIDDLEWARE BẢO MẬT
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 🌐 CORS CONFIGURATION
app.use(cors({
  origin: appConfig.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ⚡ MIDDLEWARE HIỆU NĂNG
app.use(compression()); // Nén response
app.use(express.json({ limit: '10mb' })); // Giới hạn kích thước request
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 📊 LOGGING MIDDLEWARE
app.use(morgan(appConfig.isDev ? 'dev' : 'combined', {
  skip: (req) => req.path === '/health' // Bỏ log health check
}));

// 🛡️ RATE LIMITING CHO API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: appConfig.isDev ? 1000 : 100, // Giới hạn request
  message: {
    error: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// 🏥 HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 🎯 API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);

// 🔍 DEBUG ENDPOINT (chỉ trong development)
if (appConfig.isDev) {
  app.get('/api/debug/config', (req, res) => {
    res.json({
      environment: appConfig.env,
      port: appConfig.port,
      db: { /* ẩn thông tin nhạy cảm */ },
      jwt: { /* ẩn thông tin nhạy cảm */ },
      features: {
        audit: appConfig.logging.enableAudit,
        cors: appConfig.cors.origin
      }
    });
  });
}

// ❌ HANDLE 404 - KHÔNG TÌM THẤY ROUTE
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Không tìm thấy endpoint',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 🚨 ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  console.error('🚨 Lỗi hệ thống:', error);

  // 🎯 PHÂN LOẠI LỖI
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dữ liệu không hợp lệ',
      details: error.details?.map(detail => detail.message) || [error.message]
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token không hợp lệ'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token đã hết hạn'
    });
  }

  // 🎯 LỖI MẶC ĐỊNH
  const statusCode = error.statusCode || 500;
  const message = appConfig.isDev ? error.message : 'Đã xảy ra lỗi hệ thống';

  res.status(statusCode).json({
    error: message,
    ...(appConfig.isDev && { stack: error.stack })
  });
});

module.exports = app;