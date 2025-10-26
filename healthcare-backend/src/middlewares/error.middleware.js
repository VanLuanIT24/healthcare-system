// src/middlewares/error.middleware.js
const { appConfig } = require('../config');

/**
 * 🛡️ MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG
 * - Bắt và xử lý tất cả lỗi trong ứng dụng
 * - Log lỗi chi tiết cho developer
 * - Trả về response thân thiện cho client
 */

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// 🎯 DANH SÁCH LỖI ĐẶC BIỆT
const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_TOKEN: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  AUTH_ACCOUNT_LOCKED: 'AUTH_004',
  
  // Validation errors
  VALIDATION_FAILED: 'VAL_001',
  DUPLICATE_ENTRY: 'VAL_002',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  
  // Business logic errors
  PATIENT_DATA_ACCESS_DENIED: 'BIZ_001',
  MEDICAL_RECORD_NOT_FOUND: 'BIZ_002',
  APPOINTMENT_CONFLICT: 'BIZ_003',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'SYS_001',
  SERVICE_UNAVAILABLE: 'SYS_002',
};

/**
 * 🎯 MIDDLEWARE XỬ LÝ LỖI CHÍNH
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // 📊 LOG LỖI CHI TIẾT
  logError(error, req);

  // 🔹 JWT ERRORS
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token đã hết hạn', 401, ERROR_CODES.AUTH_TOKEN_EXPIRED);
  }

  // 🔹 MONGOOSE ERRORS
  if (err.name === 'CastError') {
    const message = 'Định dạng ID không hợp lệ';
    error = new AppError(message, 400, ERROR_CODES.VALIDATION_FAILED);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại trong hệ thống`;
    error = new AppError(message, 409, ERROR_CODES.DUPLICATE_ENTRY);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Dữ liệu không hợp lệ: ${messages.join(', ')}`;
    error = new AppError(message, 400, ERROR_CODES.VALIDATION_FAILED);
  }

  // 🔹 RESPONSE CHO CLIENT
  const errorResponse = {
    success: false,
    error: {
      code: error.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message || 'Lỗi máy chủ nội bộ',
      timestamp: error.timestamp,
      
      // 🎯 CHỈ TRẢ VỀ STACK TRACE TRONG MÔI TRƯỜNG DEVELOPMENT
      ...(appConfig.isDev && { stack: error.stack }),
      
      // 🎯 THÔNG TIN BỔ SUNG CHO MỘT SỐ LỖI
      ...(error.details && { details: error.details }),
    }
  };

  // 🎯 STATUS CODE MẶC ĐỊNH
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json(errorResponse);
}

/**
 * 📊 LOG LỖI CHI TIẾT
 */
function logError(error, req) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.errorCode,
      statusCode: error.statusCode,
    }
  };

  // 🎯 PHÂN LOẠI LOG THEO MỨC ĐỘ
  if (error.statusCode >= 500) {
    console.error('❌ LỖI HỆ THỐNG:', logData);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️ LỖI NGƯỜI DÙNG:', logData);
  } else {
    console.info('ℹ️ LỖI THÔNG TIN:', logData);
  }
}

/**
 * 🎯 MIDDLEWARE BẮT LỖI 404
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
}

/**
 * 🎯 MIDDLEWARE BẮT LỖI ASYNC
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ERROR_CODES,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};