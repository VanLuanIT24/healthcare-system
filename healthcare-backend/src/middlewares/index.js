// src/middlewares/index.js
/**
 * 🛡️ TỔNG HỢP TẤT CẢ MIDDLEWARE CHO HEALTHCARE SYSTEM
 */

// 🔐 AUTHENTICATION
const {
  authenticate,
  requirePermission,
  requireRole,
} = require("./auth.middleware");
const { markPublic } = require("./public.middleware");
const {
  authPatient,
  checkPatientOwnership,
  patientOnly,
} = require("./patientPortal.middleware");

// 🛡️ SECURITY
const {
  helmetConfig,
  noSqlInjectionProtection,
  xssProtection,
  hppProtection,
  corsConfig,
  bruteForceProtection,
  securityHeaders,
  limitPayloadSize,
  maintenanceMode,
  requestLogger,
} = require("./security.middleware");

// 📝 VALIDATION
const {
  validate,
  validateParams,
  validateQuery,
  validateBody,
  sanitizeInput,
  commonSchemas,
  medicalSchemas,
} = require("./validation.middleware");

// 🎯 ERROR HANDLING
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ERROR_CODES,
} = require("./error.middleware");

// 📊 AUDIT LOG
const {
  auditLog,
  autoAuditMiddleware,
  AUDIT_ACTIONS,
} = require("./audit.middleware");

// ⚡ RATE LIMITING
const { loginLimiter } = require("./rateLimiter");

// 🔐 RBAC
const {
  requireRole: rbacRequireRole,
  requirePermission: rbacRequirePermission,
} = require("./rbac.middleware");

module.exports = {
  // Authentication
  authenticate,
  requirePermission,
  requireRole,
  markPublic,
  authPatient,
  checkPatientOwnership,
  patientOnly,

  // Security
  helmetConfig,
  noSqlInjectionProtection,
  xssProtection,
  hppProtection,
  corsConfig,
  bruteForceProtection,
  securityHeaders,
  limitPayloadSize,
  maintenanceMode,
  requestLogger,

  // Validation
  validate,
  validateParams,
  validateQuery,
  validateBody,
  sanitizeInput,
  commonSchemas,
  medicalSchemas,

  // Error Handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ERROR_CODES,

  // Audit Log
  auditLog,
  autoAuditMiddleware,
  AUDIT_ACTIONS,

  // Rate Limiting
  loginLimiter,

  // RBAC
  rbacRequireRole,
  rbacRequirePermission,
};
