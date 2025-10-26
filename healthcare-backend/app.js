// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { appConfig } = require('./src/config');
const { initializeConfig } = require('./src/config');

// 🎯 IMPORT ROUTES
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const superAdminRoutes = require('./src/routes/superAdmin.routes');

// 🆕 THÊM CÁC ROUTES KHÁC (khi có)
// const patientRoutes = require('./src/routes/patient.routes');
// const appointmentRoutes = require('./src/routes/appointment.routes');
// const medicalRoutes = require('./src/routes/medical.routes');

/**
 * ỨNG DỤNG EXPRESS CHÍNH - ĐÃ CẬP NHẬT
 * - Tích hợp đầy đủ các routes
 * - Cấu hình middleware bảo mật và hiệu năng
 * - Định tuyến API endpoints hoàn chỉnh
 */

// 🚀 KHỞI TẠO ỨNG DỤNG EXPRESS
const app = express();

// 🔧 KHỞI TẠO CẤU HÌNH HỆ THỐNG
initializeConfig().catch(error => {
  console.error('❌ Lỗi khởi tạo cấu hình:', error);
  process.exit(1);
});

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

// 🌐 CORS CONFIGURATION - CẬP NHẬT CHO FRONTEND
app.use(cors({
  origin: appConfig.cors.origin || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Requested-By',
    'X-Emergency-Access' // 🆕 THÊM HEADER CHO EMERGENCY ACCESS
  ],
}));

// ⚡ MIDDLEWARE HIỆU NĂNG
app.use(compression()); // Nén response
app.use(express.json({ limit: '10mb' })); // Giới hạn kích thước request
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 📊 LOGGING MIDDLEWARE - CẢI THIỆN
app.use(morgan(appConfig.isDev ? 'dev' : 'combined', {
  skip: (req) => {
    // Bỏ log các endpoint không cần thiết
    return req.path === '/health' || 
           req.path === '/favicon.ico' ||
           req.method === 'OPTIONS';
  },
  stream: {
    write: (message) => {
      console.log(message.trim());
    }
  }
}));

// 🛡️ RATE LIMITING CHO API - CẬP NHẬT
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // 🆕 BỎ QUA RATE LIMIT CHO HEALTH CHECK VÀ MỘT SỐ TRƯỜNG HỢP ĐẶC BIỆT
      return req.path === '/health' || 
             req.method === 'OPTIONS' ||
             (req.headers['x-emergency-access'] === 'true' && appConfig.isDev);
    }
  });
};

// 🎯 ÁP DỤNG RATE LIMITING THEO TỪNG LOẠI
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 phút
  appConfig.isDev ? 1000 : 200, // Giới hạn request
  'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút.'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 phút
  appConfig.isDev ? 50 : 10, // Giới hạn thấp hơn cho auth
  'Quá nhiều attempt đăng nhập, vui lòng thử lại sau 15 phút.'
);

const criticalLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 giờ
  appConfig.isDev ? 100 : 20, // Giới hạn rất thấp cho API quan trọng
  'Quá nhiều request tới API quan trọng, vui lòng thử lại sau 1 giờ.'
);

// 🎯 ÁP DỤNG RATE LIMITING
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/super-admin/', criticalLimiter);
app.use('/api/users/', generalLimiter);

// 🏥 HEALTH CHECK ENDPOINT - CẢI THIỆN
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.env,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  };

  res.status(200).json(healthCheck);
});

// 🆕 ROOT ENDPOINT - HIỂN THỊ THÔNG TIN API
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Healthcare System API - Đang hoạt động',
    version: '1.0.0',
    environment: appConfig.env,
    timestamp: new Date().toISOString(),
    documentation: '/api/docs', // 🆕 CÓ THỂ THÊM SWAGGER SAU NÀY
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      superAdmin: '/api/super-admin',
      health: '/health'
    }
  });
});

// 🎯 API ROUTES - ĐÃ THÊM USER ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/super-admin', superAdminRoutes);

// 🆕 THÊM CÁC ROUTES KHÁC KHI CẦN
// app.use('/api/patients', patientRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/medical', medicalRoutes);

// 🔍 DEBUG ENDPOINT (chỉ trong development) - CẢI THIỆN
if (appConfig.isDev) {
  app.get('/api/debug/config', (req, res) => {
    // 🛡️ ẨN THÔNG TIN NHẠY CẢM
    const safeConfig = {
      environment: appConfig.env,
      port: appConfig.port,
      db: {
        host: appConfig.db.host ? '***' : undefined,
        name: appConfig.db.name
      },
      jwt: {
        accessExpiry: appConfig.jwt.accessExpiry,
        refreshExpiry: appConfig.jwt.refreshExpiry
      },
      security: {
        saltRounds: appConfig.security.saltRounds,
        maxLoginAttempts: appConfig.security.maxLoginAttempts
      },
      email: {
        smtpHost: appConfig.email.smtpHost,
        from: appConfig.email.from
      },
      cors: {
        origin: appConfig.cors.origin
      },
      logging: {
        level: appConfig.logging.level,
        enableAudit: appConfig.logging.enableAudit
      },
      hospital: {
        name: appConfig.hospital.name,
        supportEmail: appConfig.hospital.supportEmail
      }
    };

    res.json(safeConfig);
  });

  // 🆕 ENDPOINT KIỂM TRA ROUTES
  app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    
    app._router.stack.forEach(middleware => {
      if (middleware.route) {
        // Routes trực tiếp
        const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase());
        routes.push({
          path: middleware.route.path,
          methods: methods
        });
      } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach(handler => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).map(method => method.toUpperCase());
            routes.push({
              path: middleware.regexp.toString().replace(/^\/\^\\|\\\/\?\(\?=\\\/\|\$\)\/\w/g, '') + handler.route.path,
              methods: methods
            });
          }
        });
      }
    });

    res.json({
      totalRoutes: routes.length,
      routes: routes
    });
  });
}

// ❌ HANDLE 404 - KHÔNG TÌM THẤY ROUTE - CẢI THIỆN
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Không tìm thấy endpoint',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Kiểm tra lại đường dẫn hoặc tham khảo documentation tại /api/docs'
  });
});

// 🚨 ERROR HANDLING MIDDLEWARE - CẢI THIỆN
app.use((error, req, res, next) => {
  console.error('🚨 Lỗi hệ thống:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 🎯 PHÂN LOẠI LỖI CHI TIẾT HƠN
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Dữ liệu không hợp lệ',
      code: 'VALIDATION_ERROR',
      details: error.details?.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })) || [error.message]
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token không hợp lệ',
      code: 'INVALID_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token đã hết hạn',
      code: 'TOKEN_EXPIRED'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File quá lớn',
      code: 'FILE_TOO_LARGE'
    });
  }

  // 🎯 LỖI RBAC & PERMISSION
  if (error.code && error.code.startsWith('AUTH_')) {
    return res.status(error.statusCode || 403).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }

  // 🎯 LỖI DATABASE
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    const dbError = appConfig.isDev ? error.message : 'Lỗi cơ sở dữ liệu';
    return res.status(500).json({
      success: false,
      error: dbError,
      code: 'DATABASE_ERROR'
    });
  }

  // 🎯 LỖI MẶC ĐỊNH
  const statusCode = error.statusCode || error.status || 500;
  const message = appConfig.isDev ? error.message : 'Đã xảy ra lỗi hệ thống';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(appConfig.isDev && { 
      stack: error.stack,
      code: error.code 
    })
  });
});

// 🆕 GRACEFUL SHUTDOWN HANDLING
process.on('SIGTERM', () => {
  console.log('🔄 Nhận tín hiệu SIGTERM, đang tắt server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Nhận tín hiệu SIGINT, đang tắt server...');
  process.exit(0);
});

module.exports = app;