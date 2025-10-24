const AuditLog = require('../models/auditLog.model');
const { appConfig } = require('../config');

/**
 * 🛡️ MIDDLEWARE AUDIT LOG CHO HEALTHCARE SYSTEM
 * - Ghi lại tất cả hoạt động quan trọng trong hệ thống
 * - Tuân thủ HIPAA và các quy định y tế
 * - Theo dõi truy cập dữ liệu bệnh nhân
 */

/**
 * 🎯 ACTION TYPES CHO HEALTHCARE
 */
const AUDIT_ACTIONS = {
  // 🔐 AUTHENTICATION
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  
  // 👥 USER MANAGEMENT
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_DISABLE: 'USER_DISABLE',
  
  // 🏥 PATIENT DATA ACCESS (QUAN TRỌNG)
  PATIENT_VIEW: 'PATIENT_VIEW',
  PATIENT_CREATE: 'PATIENT_CREATE',
  PATIENT_UPDATE: 'PATIENT_UPDATE',
  PATIENT_DELETE: 'PATIENT_DELETE',
  
  // 🩺 MEDICAL RECORDS
  MEDICAL_RECORD_VIEW: 'MEDICAL_RECORD_VIEW',
  MEDICAL_RECORD_CREATE: 'MEDICAL_RECORD_CREATE',
  MEDICAL_RECORD_UPDATE: 'MEDICAL_RECORD_UPDATE',
  MEDICAL_RECORD_DELETE: 'MEDICAL_RECORD_DELETE',
  MEDICAL_RECORD_EXPORT: 'MEDICAL_RECORD_EXPORT',
  
  // 📅 APPOINTMENTS
  APPOINTMENT_VIEW: 'APPOINTMENT_VIEW',
  APPOINTMENT_CREATE: 'APPOINTMENT_CREATE',
  APPOINTMENT_UPDATE: 'APPOINTMENT_UPDATE',
  APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
  
  // 💊 PRESCRIPTIONS
  PRESCRIPTION_VIEW: 'PRESCRIPTION_VIEW',
  PRESCRIPTION_CREATE: 'PRESCRIPTION_CREATE',
  PRESCRIPTION_UPDATE: 'PRESCRIPTION_UPDATE',
  PRESCRIPTION_DISPENSE: 'PRESCRIPTION_DISPENSE',
  
  // 🔬 LAB RESULTS
  LAB_RESULT_VIEW: 'LAB_RESULT_VIEW',
  LAB_RESULT_CREATE: 'LAB_RESULT_CREATE',
  LAB_RESULT_UPDATE: 'LAB_RESULT_UPDATE',
  LAB_RESULT_APPROVE: 'LAB_RESULT_APPROVE',
  
  // 💰 BILLING
  BILL_VIEW: 'BILL_VIEW',
  BILL_CREATE: 'BILL_CREATE',
  BILL_UPDATE: 'BILL_UPDATE',
  PAYMENT_PROCESS: 'PAYMENT_PROCESS',
  
  // 🚨 EMERGENCY ACCESS
  EMERGENCY_ACCESS: 'EMERGENCY_ACCESS',
  
  // ⚠️ SECURITY EVENTS
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_DELETION: 'DATA_DELETION',
};

/**
 * 🎯 MIDDLEWARE AUDIT LOG CHÍNH
 */
function auditLog(action, options = {}) {
  return async (req, res, next) => {
    // 🎯 BỎ QUA NẾU AUDIT LOG BỊ TẮT
    if (!appConfig.logging.enableAudit) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    // 🎯 GHI NHẬN THÔNG TIN REQUEST
    const auditData = {
      action,
      timestamp: new Date(),
      user: req.user ? {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
      } : null,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: sanitizeQuery(req.query),
      body: sanitizeBody(req.body, options.sensitiveFields),
      ...options.metadata,
    };

    // 🎯 GHI ĐÈ PHƯƠNG THỨC RESPONSE
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // 🎯 GHI LOG BẤT ĐỒNG BỘ (KHÔNG ẢNH HƯỞNG ĐẾN RESPONSE)
      process.nextTick(async () => {
        try {
          const finalAuditData = {
            ...auditData,
            responseTime,
            statusCode: res.statusCode,
            responseSize: Buffer.byteLength(data || '', 'utf8'),
            success: res.statusCode < 400,
          };

          await AuditLog.create(finalAuditData);
          
          // 🎯 LOG REAL-TIME CHO CÁC SỰ KIỆN QUAN TRỌNG
          if (isCriticalAction(action) || res.statusCode >= 400) {
            console.log('🔍 AUDIT LOG:', {
              action,
              user: auditData.user?.email,
              status: res.statusCode,
              responseTime: `${responseTime}ms`,
            });
          }
        } catch (error) {
          console.error('❌ Lỗi ghi audit log:', error.message);
        }
      });

      // 🎯 GỌI PHƯƠNG THỨC GỐC
      originalSend.call(this, data);
    };

    next();
  };
}

/**
 * 🎯 LẤY IP CLIENT THỰC SỰ
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * 🎯 SANITIZE QUERY PARAMETERS
 */
function sanitizeQuery(query) {
  const sanitized = { ...query };
  
  // 🎯 ẨN CÁC THAM SỐ NHẠY CẢM
  const sensitiveQueryParams = ['password', 'token', 'secret', 'key'];
  sensitiveQueryParams.forEach(param => {
    if (sanitized[param]) {
      sanitized[param] = '***HIDDEN***';
    }
  });
  
  return sanitized;
}

/**
 * 🎯 SANITIZE REQUEST BODY
 */
function sanitizeBody(body, sensitiveFields = []) {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = JSON.parse(JSON.stringify(body));
  const defaultSensitiveFields = [
    'password', 
    'passwordHash', 
    'token', 
    'refreshToken',
    'accessToken',
    'secret',
    'creditCard',
    'ssn',
    'healthInsuranceNumber',
  ];
  
  const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
  
  function sanitizeObject(obj) {
    for (const key in obj) {
      if (allSensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        obj[key] = '***HIDDEN***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
  
  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * 🎯 KIỂM TRA ACTION QUAN TRỌNG
 */
function isCriticalAction(action) {
  const criticalActions = [
    'PATIENT_VIEW',
    'MEDICAL_RECORD_VIEW', 
    'MEDICAL_RECORD_UPDATE',
    'EMERGENCY_ACCESS',
    'UNAUTHORIZED_ACCESS',
    'DATA_EXPORT',
    'USER_DELETE',
  ];
  
  return criticalActions.includes(action);
}

/**
 * 🎯 MIDDLEWARE AUDIT LOG TỰ ĐỘNG CHO CÁC ROUTE QUAN TRỌNG
 */
function autoAuditMiddleware(req, res, next) {
  const action = getActionFromRoute(req);
  
  if (action) {
    return auditLog(action)(req, res, next);
  }
  
  next();
}

/**
 * 🎯 XÁC ĐỊNH ACTION TỪ ROUTE
 */
function getActionFromRoute(req) {
  const { method, originalUrl } = req;
  
  // 🎯 MAP ROUTE TO ACTION
  const routePatterns = {
    // PATIENT ROUTES
    'GET:/api/patients': 'PATIENT_VIEW',
    'POST:/api/patients': 'PATIENT_CREATE',
    'PUT:/api/patients/': 'PATIENT_UPDATE',
    'DELETE:/api/patients/': 'PATIENT_DELETE',
    
    // MEDICAL RECORDS
    'GET:/api/medical-records': 'MEDICAL_RECORD_VIEW',
    'POST:/api/medical-records': 'MEDICAL_RECORD_CREATE',
    'PUT:/api/medical-records/': 'MEDICAL_RECORD_UPDATE',
    'DELETE:/api/medical-records/': 'MEDICAL_RECORD_DELETE',
    
    // APPOINTMENTS
    'GET:/api/appointments': 'APPOINTMENT_VIEW',
    'POST:/api/appointments': 'APPOINTMENT_CREATE',
    'PUT:/api/appointments/': 'APPOINTMENT_UPDATE',
    'DELETE:/api/appointments/': 'APPOINTMENT_CANCEL',
    
    // AUTH
    'POST:/api/auth/login': 'LOGIN',
    'POST:/api/auth/logout': 'LOGOUT',
    'POST:/api/auth/refresh': 'TOKEN_REFRESH',
  };
  
  const routeKey = `${method}:${originalUrl.split('?')[0]}`;
  
  // 🎯 TÌM PATTERN PHÙ HỢP
  for (const [pattern, action] of Object.entries(routePatterns)) {
    if (routeKey.startsWith(pattern)) {
      return action;
    }
  }
  
  return null;
}

module.exports = {
  auditLog,
  autoAuditMiddleware,
  AUDIT_ACTIONS,
  getClientIP,
};