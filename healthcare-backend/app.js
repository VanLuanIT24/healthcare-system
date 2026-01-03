// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 📚 SWAGGER API DOCUMENTATION
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.config');

const { appConfig } = require('./src/config');
const { initializeConfig } = require('./src/config');

// 🎯 IMPORT ROUTES
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const doctorRoutes = require('./src/routes/doctor.routes');
const superAdminRoutes = require('./src/routes/superAdmin.routes');
const adminRoutes = require('./src/routes/admin.routes'); // 🆕 ADMIN ROUTES
const dashboardRoutes = require('./src/routes/dashboard.routes'); // 🆕 DASHBOARD STATS ROUTES
const appointmentRoutes = require('./src/routes/appointment.routes');
const medicalRecordRoutes = require('./src/routes/medicalRecord.routes');
const clinicalRoutes = require('./src/routes/clinical.routes');
const patientRoutes = require('./src/routes/patient.routes');
const prescriptionRoutes = require('./src/routes/prescription.routes');
const laboratoryRoutes = require('./src/routes/laboratory.routes');
const medicationRoutes = require('./src/routes/medication.routes'); // 🆕 MEDICATION ROUTES
const publicRoutes = require('./src/routes/public.routes'); // 🆕 PUBLIC ROUTES
const billingRoutes = require('./src/routes/billing.routes'); // 🆕 BILLING ROUTES
const reportRoutes = require('./src/routes/report.routes'); // 🆕 REPORT ROUTES
const settingsRoutes = require('./src/routes/settings.routes'); // 🆕 SETTINGS ROUTES
const queueRoutes = require('./src/routes/queue.routes');
const bedRoutes = require('./src/routes/bed.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const notificationRoutes = require('./src/routes/notification.routes');

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
      scriptSrc: ["'self'", "'unsafe-inline'"], // 📚 Cho phép Swagger UI
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
      return true; // Temporarily disabled by user request
      /*
      // 🆕 BỎ QUA RATE LIMIT CHO HEALTH CHECK VÀ MỘT SỐ TRƯỜNG HỢP ĐẶC BIỆT
      return req.path === '/health' || 
             req.method === 'OPTIONS' ||
             (req.headers['x-emergency-access'] === 'true' && appConfig.isDev);
      */
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

// 📚 SWAGGER API DOCUMENTATION - GIAO DIỆN CHUYÊN NGHIỆP
const swaggerCss = `
  /* ===== FONTS ===== */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  * { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important; }
  
  /* ===== BODY ===== */
  body { 
    background: #f8fafc;
    margin: 0;
    padding: 0;
  }
  
  /* ===== MAIN CONTAINER ===== */
  .swagger-ui { 
    background: #ffffff;
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 40px;
    min-height: 100vh;
  }
  
  /* ===== HIDE TOPBAR ===== */
  .swagger-ui .topbar { display: none; }
  
  /* ===== HEADER INFO ===== */
  .swagger-ui .info { 
    margin: 0 0 32px 0;
    padding: 0;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 32px;
  }
  
  .swagger-ui .info hgroup.main { margin-bottom: 16px; }
  
  .swagger-ui .info .title { 
    font-size: 32px; 
    font-weight: 700; 
    color: #0f172a !important;
    letter-spacing: -0.5px;
  }
  
  .swagger-ui .info .title small { 
    background: #0ea5e9;
    color: #fff !important;
    padding: 4px 10px; 
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    vertical-align: middle;
    margin-left: 12px;
  }
  
  .swagger-ui .info .description { 
    color: #475569 !important;
    font-size: 14px;
    line-height: 1.7;
  }
  
  .swagger-ui .info .description h1 { font-size: 24px; color: #0f172a !important; font-weight: 700; margin-top: 24px; }
  .swagger-ui .info .description h2 { font-size: 18px; color: #1e293b !important; font-weight: 600; margin-top: 20px; }
  .swagger-ui .info .description h3 { font-size: 16px; color: #334155 !important; font-weight: 600; margin-top: 16px; }
  .swagger-ui .info .description p { color: #475569 !important; margin: 8px 0; }
  
  .swagger-ui .info .description code { 
    background: #f1f5f9 !important; 
    color: #0369a1 !important;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', monospace !important;
  }
  
  .swagger-ui .info .description table { 
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  
  .swagger-ui .info .description th { 
    background: #f8fafc !important; 
    color: #0f172a !important;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 13px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .swagger-ui .info .description td { 
    color: #475569 !important;
    padding: 12px 16px;
    font-size: 14px;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .swagger-ui .info .description a { 
    color: #0284c7 !important; 
    text-decoration: none;
    font-weight: 500;
  }
  .swagger-ui .info .description a:hover { text-decoration: underline; }
  
  /* ===== SCHEMES & AUTH BAR ===== */
  .swagger-ui .scheme-container { 
    background: #f8fafc !important;
    padding: 16px 20px !important;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: none !important;
    border: 1px solid #e2e8f0;
  }
  
  /* ===== AUTHORIZE BUTTON ===== */
  .swagger-ui .btn.authorize { 
    background: #0f172a !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    letter-spacing: 0.3px;
    transition: all 0.2s ease !important;
  }
  
  .swagger-ui .btn.authorize:hover { 
    background: #1e293b !important;
  }
  
  .swagger-ui .btn.authorize svg { fill: #fff !important; }
  
  .swagger-ui .authorization__btn svg { 
    fill: #64748b !important;
  }
  
  .swagger-ui .authorization__btn.locked svg { 
    fill: #059669 !important;
  }
  
  /* ===== TAG SECTIONS ===== */
  .swagger-ui .opblock-tag-section { 
    margin-bottom: 8px;
  }
  
  .swagger-ui .opblock-tag { 
    font-size: 15px !important; 
    font-weight: 600 !important; 
    color: #0f172a !important;
    padding: 16px 0 !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid #e2e8f0 !important;
    border-radius: 0 !important;
    margin: 0 !important;
    transition: all 0.15s ease !important;
  }
  
  .swagger-ui .opblock-tag:hover { 
    color: #0284c7 !important;
  }
  
  .swagger-ui .opblock-tag small { 
    color: #64748b !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }
  
  .swagger-ui .opblock-tag svg { fill: #94a3b8 !important; }
  
  /* ===== API OPERATIONS ===== */
  .swagger-ui .opblock { 
    border-radius: 8px !important;
    margin: 4px 0 !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: none !important;
    overflow: hidden;
    transition: all 0.15s ease !important;
  }
  
  .swagger-ui .opblock:hover { 
    border-color: #cbd5e1 !important;
  }
  
  .swagger-ui .opblock .opblock-summary { 
    padding: 12px 16px !important;
    border: none !important;
  }
  
  /* GET - Blue */
  .swagger-ui .opblock.opblock-get { 
    background: #ffffff !important;
    border-left: 3px solid #3b82f6 !important;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary { background: #f8fafc !important; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { 
    background: #3b82f6 !important;
  }
  
  /* POST - Green */
  .swagger-ui .opblock.opblock-post { 
    background: #ffffff !important;
    border-left: 3px solid #22c55e !important;
  }
  .swagger-ui .opblock.opblock-post .opblock-summary { background: #f8fafc !important; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { 
    background: #22c55e !important;
  }
  
  /* PUT - Orange */
  .swagger-ui .opblock.opblock-put { 
    background: #ffffff !important;
    border-left: 3px solid #f59e0b !important;
  }
  .swagger-ui .opblock.opblock-put .opblock-summary { background: #f8fafc !important; }
  .swagger-ui .opblock.opblock-put .opblock-summary-method { 
    background: #f59e0b !important;
  }
  
  /* DELETE - Red */
  .swagger-ui .opblock.opblock-delete { 
    background: #ffffff !important;
    border-left: 3px solid #ef4444 !important;
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary { background: #f8fafc !important; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { 
    background: #ef4444 !important;
  }
  
  /* PATCH - Purple */
  .swagger-ui .opblock.opblock-patch { 
    background: #ffffff !important;
    border-left: 3px solid #a855f7 !important;
  }
  .swagger-ui .opblock.opblock-patch .opblock-summary { background: #f8fafc !important; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { 
    background: #a855f7 !important;
  }
  
  /* Method Badge */
  .swagger-ui .opblock .opblock-summary-method { 
    font-weight: 600 !important; 
    min-width: 70px !important;
    padding: 6px 0 !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    letter-spacing: 0.5px;
  }
  
  .swagger-ui .opblock .opblock-summary-path { 
    font-weight: 500 !important;
    font-size: 14px !important;
    color: #1e293b !important;
  }
  
  .swagger-ui .opblock .opblock-summary-path__deprecated { 
    text-decoration: line-through;
    color: #94a3b8 !important;
  }
  
  .swagger-ui .opblock .opblock-summary-description { 
    color: #64748b !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }
  
  /* ===== EXPANDED OPERATION ===== */
  .swagger-ui .opblock.is-open .opblock-summary { 
    border-bottom: 1px solid #e2e8f0 !important;
  }
  
  .swagger-ui .opblock-body { 
    background: #fff !important;
    padding: 20px !important;
  }
  
  .swagger-ui .opblock-section-header { 
    background: #f8fafc !important;
    border-radius: 6px !important;
    padding: 12px 16px !important;
    margin-bottom: 12px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: none !important;
  }
  
  .swagger-ui .opblock-section-header h4 { 
    font-weight: 600 !important;
    font-size: 13px !important;
    color: #334155 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .swagger-ui .opblock-description-wrapper { 
    padding: 12px 0 !important;
  }
  
  .swagger-ui .opblock-description-wrapper p { 
    color: #475569 !important;
    font-size: 14px !important;
  }
  
  /* ===== PARAMETERS TABLE ===== */
  .swagger-ui table.parameters { 
    margin: 0 !important;
  }
  
  .swagger-ui .parameters-col_name { 
    font-weight: 500 !important;
    color: #0f172a !important;
    font-size: 13px !important;
  }
  
  .swagger-ui .parameters-col_description { 
    color: #475569 !important;
    font-size: 13px !important;
  }
  
  .swagger-ui .parameter__name { 
    font-weight: 600 !important;
    color: #0f172a !important;
  }
  
  .swagger-ui .parameter__name.required::after { 
    color: #ef4444 !important;
  }
  
  .swagger-ui .parameter__type { 
    color: #64748b !important;
    font-size: 12px !important;
  }
  
  /* ===== BUTTONS ===== */
  .swagger-ui .btn { 
    border-radius: 6px !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    transition: all 0.15s ease !important;
  }
  
  .swagger-ui .btn.execute { 
    background: #0f172a !important;
    border: none !important;
    padding: 10px 24px !important;
    font-weight: 600 !important;
  }
  
  .swagger-ui .btn.execute:hover { 
    background: #1e293b !important;
  }
  
  .swagger-ui .btn.cancel { 
    background: #fff !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
  }
  
  .swagger-ui .btn.cancel:hover { 
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
  
  /* ===== TRY IT OUT ===== */
  .swagger-ui .try-out__btn { 
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
    background: #fff !important;
  }
  
  .swagger-ui .try-out__btn:hover { 
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
  }
  
  /* ===== RESPONSES ===== */
  .swagger-ui .responses-wrapper { 
    padding: 0 !important;
  }
  
  .swagger-ui .responses-inner { 
    padding: 0 !important;
  }
  
  .swagger-ui table.responses-table { 
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    overflow: hidden;
  }
  
  .swagger-ui .responses-table thead tr { 
    background: #f8fafc !important;
  }
  
  .swagger-ui .responses-table thead tr th { 
    color: #334155 !important;
    font-weight: 600 !important;
    font-size: 12px !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 16px !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }
  
  .swagger-ui .responses-table tbody tr td { 
    padding: 12px 16px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    color: #475569 !important;
  }
  
  .swagger-ui .response-col_status { 
    font-weight: 600 !important;
    color: #0f172a !important;
  }
  
  .swagger-ui .response-col_description { 
    color: #475569 !important;
  }
  
  /* ===== CODE BLOCKS ===== */
  .swagger-ui .highlight-code { 
    border-radius: 6px !important;
    overflow: hidden;
  }
  
  .swagger-ui .highlight-code pre { 
    background: #0f172a !important;
    padding: 16px !important;
    margin: 0 !important;
    border-radius: 6px !important;
  }
  
  .swagger-ui .highlight-code code { 
    color: #e2e8f0 !important;
    font-family: 'SF Mono', 'Fira Code', monospace !important;
    font-size: 13px !important;
  }
  
  /* ===== MODELS SECTION ===== */
  .swagger-ui section.models { 
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background: #fff !important;
    margin-top: 32px;
  }
  
  .swagger-ui section.models h4 { 
    font-size: 15px !important; 
    font-weight: 600 !important;
    padding: 16px 20px !important; 
    background: #f8fafc !important;
    color: #0f172a !important;
    border-bottom: 1px solid #e2e8f0 !important;
    margin: 0 !important;
  }
  
  .swagger-ui section.models .model-container { 
    padding: 16px 20px !important;
    margin: 0 !important;
    background: #fff !important;
  }
  
  .swagger-ui .model-title { 
    font-weight: 600 !important;
    color: #0f172a !important;
  }
  
  .swagger-ui .model { 
    font-size: 13px !important;
    color: #475569 !important;
  }
  
  /* ===== FILTER INPUT ===== */
  .swagger-ui .filter-container { 
    margin: 0 0 24px 0 !important;
  }
  
  .swagger-ui .filter-container input { 
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
    background: #fff !important;
    color: #0f172a !important;
    transition: all 0.15s ease !important;
    width: 300px !important;
  }
  
  .swagger-ui .filter-container input::placeholder { 
    color: #94a3b8 !important;
  }
  
  .swagger-ui .filter-container input:focus { 
    border-color: #3b82f6 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  /* ===== INPUTS ===== */
  .swagger-ui input[type=text], 
  .swagger-ui textarea,
  .swagger-ui select { 
    border-radius: 6px !important;
    border: 1px solid #e2e8f0 !important;
    padding: 10px 12px !important;
    font-size: 13px !important;
    color: #0f172a !important;
    background: #fff !important;
    transition: all 0.15s ease !important;
  }
  
  .swagger-ui input[type=text]:focus, 
  .swagger-ui textarea:focus,
  .swagger-ui select:focus { 
    border-color: #3b82f6 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  /* ===== LOADING ===== */
  .swagger-ui .loading-container { 
    padding: 40px !important;
  }
  
  /* ===== COPY BUTTON ===== */
  .swagger-ui .copy-to-clipboard { 
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 4px !important;
  }
  
  .swagger-ui .copy-to-clipboard button { 
    background: transparent !important;
  }
  
  /* ===== MARKDOWN ===== */
  .swagger-ui .markdown p, 
  .swagger-ui .markdown li { 
    color: #475569 !important;
  }
  
  .swagger-ui .markdown code { 
    background: #f1f5f9 !important;
    color: #0369a1 !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
  }
`;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: swaggerCss,
  customSiteTitle: 'Healthcare System API',
  customfavIcon: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 1,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    tryItOutEnabled: true
  }
}));

// 📄 SWAGGER JSON ENDPOINT
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 🆕 ROOT ENDPOINT - HIỂN THỊ THÔNG TIN API
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Healthcare System API - Đang hoạt động',
    version: '1.0.0',
    environment: appConfig.env,
    timestamp: new Date().toISOString(),
    documentation: '/api-docs', // 📚 SWAGGER UI
    swagger_json: '/api-docs.json', // 📄 SWAGGER JSON
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      superAdmin: '/api/super-admin',
      admin: '/api/admin',
      appointments: '/api/appointments',
      queue: '/api/queue',
      medicalRecords: '/api/medical-records',
      clinical: '/api/clinical',
      patients: '/api/patients',
      prescriptions: '/api/prescriptions',
      laboratory: '/api/laboratory',
      medications: '/api/medications',
      health: '/health'
    }
  });
});

// 🆕 CHECK AUTH STATUS ENDPOINT
app.get('/api/auth/check', (req, res) => {
  const authHeader = req.headers.authorization;
  res.json({
    hasAuthHeader: !!authHeader,
    authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    timestamp: new Date().toISOString()
  });
});

// 🎯 API ROUTES - ĐÃ SỬA LỖI (SỬ DỤNG app.use THAY VÌ router.use)
console.log('📡 Registering routes...');
app.use('/api/public', publicRoutes); // 🆕 PUBLIC ROUTES (không cần auth)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Debug middleware cho admin routes
app.use('/api/admin', (req, res, next) => {
  console.log(`🎯 [ADMIN ROUTE] ${req.method} ${req.path} (full: ${req.originalUrl})`);
  next();
});
app.use('/api/admin', dashboardRoutes); // 🆕 DASHBOARD STATS ROUTES (Moved up to prevent conflict with /users/:id)
app.use('/api/admin/doctors', doctorRoutes); // 🆕 DOCTOR MANAGEMENT ROUTES
app.use('/api/admin', adminRoutes); // 🆕 ADMIN ROUTES
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// 🆕 DOCTOR SCHEDULE ROUTES
const doctorScheduleRoutes = require('./src/routes/doctorSchedule.routes');
app.use('/api/doctor-schedules', doctorScheduleRoutes);

app.use('/api/clinical', clinicalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/v1/admin/medications', medicationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// Bed routes - support both paths
app.use('/api/beds', bedRoutes);
app.use('/api/v1/admin/beds', bedRoutes);
app.use('/beds', bedRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/messages', require('./src/routes/message.routes'));

// 📁 STATIC FILE SERVING - UPLOADS FOLDER
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/services', require('./src/routes/services.routes')); // 🆕 SERVICES/BILLING ROUTES
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/medications', medicationRoutes); // 🆕 MEDICATION API
app.use('/api/billing', billingRoutes); // 🆕 BILLING API

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
  if (error.code && typeof error.code === 'string' && error.code.startsWith('AUTH_')) {
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


