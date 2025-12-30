// src/middlewares/error.middleware.js
const { appConfig } = require('../config');

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

const ERROR_CODES = {
  AUTH_INVALID_TOKEN: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  AUTH_ACCOUNT_LOCKED: 'AUTH_004',

  VALIDATION_FAILED: 'VAL_001',
  DUPLICATE_ENTRY: 'VAL_002',

  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',

  PATIENT_DATA_ACCESS_DENIED: 'BIZ_001',
  MEDICAL_RECORD_NOT_FOUND: 'BIZ_002',
  APPOINTMENT_CONFLICT: 'BIZ_003',
  APPOINTMENT_NOT_FOUND: 'BIZ_009',
  INVALID_STATE: 'BIZ_010',
  DUPLICATE_REQUEST: 'BIZ_011',
  CANCEL_REQUEST_NOT_FOUND: 'BIZ_012',
  QUEUE_ENTRY_NOT_FOUND: 'BIZ_004',
  QUEUE_EMPTY: 'BIZ_005',
  QUEUE_DUPLICATE: 'BIZ_006',
  QUEUE_INVALID_STATE: 'BIZ_007',
  QUEUE_DOCTOR_NOT_FOUND: 'BIZ_008',

  INTERNAL_SERVER_ERROR: 'SYS_001',
  SERVICE_UNAVAILABLE: 'SYS_002',
};

function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  logError(error, req);

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token không hợp lệ', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token đã hết hạn', 401, ERROR_CODES.AUTH_TOKEN_EXPIRED);
  }

  if (err.name === 'CastError') {
    error = new AppError('Định dạng ID không hợp lệ', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} đã tồn tại`, 409, ERROR_CODES.DUPLICATE_ENTRY);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new AppError(`Dữ liệu không hợp lệ: ${messages.join(', ')}`, 400, ERROR_CODES.VALIDATION_FAILED);
  }

  const errorResponse = {
    success: false,
    error: {
      code: error.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message || 'Lỗi máy chủ nội bộ',
      timestamp: error.timestamp,
      ...(appConfig.isDev && { stack: error.stack }),
      ...(error.details && { details: error.details }),
    }
  };

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(errorResponse);
}

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

  if (error.statusCode >= 500) {
    console.error('❌ SERVER ERROR:', logData);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️ CLIENT ERROR:', logData);
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Không tìm thấy: ${req.method} ${req.originalUrl}`, 404));
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = {
  AppError,
  ERROR_CODES,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};