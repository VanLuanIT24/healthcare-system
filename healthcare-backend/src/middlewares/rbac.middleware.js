const { 
  ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROLE_HIERARCHY,
  hasPermission,
  canCreateRole,
  canAccessPatientData 
} = require('../constants/roles');
const { AppError, ERROR_CODES } = require('./error.middleware');

/**
 * 🛡️ MIDDLEWARE RBAC (ROLE-BASED ACCESS CONTROL) CHO HEALTHCARE SYSTEM
 * - Kiểm tra vai trò và quyền hạn chi tiết
 * - Hỗ trợ emergency access override
 * - Kiểm tra hierarchy trong tổ chức y tế
 */

/**
 * 🎯 MIDDLEWARE KIỂM TRA VAI TRÒ
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    // 🎯 CHO PHÉP TRUY CẬP KHẨN CẤP
    if (req.isEmergency && hasPermission(req.user.role, PERMISSIONS.EMERGENCY_ACCESS)) {
      console.log(`🚨 Emergency access granted to ${req.user.role} for ${req.originalUrl}`);
      return next();
    }

    // 🎯 KIỂM TRA VAI TRÒ
    if (!allowedRoles.includes(req.user.role) && !allowedRoles.includes('ANY')) {
      return next(new AppError(
        `Yêu cầu vai trò: ${allowedRoles.join(', ')}. Vai trò hiện tại: ${req.user.role}`,
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN CỤ THỂ
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    // 🎯 CHO PHÉP TRUY CẬP KHẨN CẤP
    if (req.isEmergency && hasPermission(req.user.role, PERMISSIONS.EMERGENCY_ACCESS)) {
      console.log(`🚨 Emergency permission override for ${permission}`);
      return next();
    }

    // 🎯 KIỂM TRA QUYỀN
    if (!hasPermission(req.user.role, permission)) {
      return next(new AppError(
        `Không có quyền: ${permission}`,
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN TẠO ROLE
 */
function requireRoleCreation(targetRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    if (!canCreateRole(req.user.role, targetRole)) {
      return next(new AppError(
        `Bạn không có quyền tạo tài khoản với vai trò ${targetRole}`,
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN TRUY CẬP DỮ LIỆU BỆNH NHÂN
 */
function requirePatientDataAccess(patientIdParam = 'patientId') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    const patientId = req.params[patientIdParam] || req.body.patientId || req.query.patientId;
    
    if (!patientId) {
      return next(new AppError('Thiếu thông tin patientId', 400, ERROR_CODES.VALIDATION_FAILED));
    }

    // 🎯 KIỂM TRA QUYỀN TRUY CẬP
    const hasAccess = canAccessPatientData(
      req.user.role, 
      patientId, 
      req.user._id.toString(), 
      req.isEmergency
    );

    if (!hasAccess) {
      return next(new AppError(
        'Không có quyền truy cập dữ liệu bệnh nhân này',
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN THEO MODULE
 */
function requireModuleAccess(module) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    // 🎯 LẤY TẤT CẢ PERMISSIONS TRONG MODULE
    const modulePermissions = Object.values(PERMISSIONS).filter(p => 
      p.startsWith(`${module}.`)
    );
    
    // 🎯 KIỂM TRA XEM CÓ ÍT NHẤT 1 QUYỀN TRONG MODULE
    const hasModulePermission = modulePermissions.some(permission => 
      hasPermission(req.user.role, permission)
    );

    if (!hasModulePermission) {
      return next(new AppError(
        `Không có quyền truy cập module: ${module}`,
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN XEM THÔNG TIN NHẠY CẢM
 */
function requireSensitiveDataAccess() {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    if (!hasPermission(req.user.role, PERMISSIONS.VIEW_USER_SENSITIVE)) {
      return next(new AppError(
        'Không có quyền xem thông tin nhạy cảm',
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN AUDIT LOG
 */
function requireAuditLogAccess() {
  return requirePermission(PERMISSIONS.AUDIT_LOG_VIEW);
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN SYSTEM CONFIG
 */
function requireSystemConfigAccess() {
  return requirePermission(PERMISSIONS.SYSTEM_CONFIG);
}

/**
 * 🎯 MIDDLEWARE GHI LOG HOẠT ĐỘNG RBAC
 */
function rbacLogger(action) {
  return (req, res, next) => {
    console.log(`🔐 RBAC Check: ${req.user.role} attempting ${action} on ${req.originalUrl}`);
    next();
  };
}

module.exports = {
  requireRole,
  requirePermission,
  requireRoleCreation,
  requirePatientDataAccess,
  requireModuleAccess,
  requireSensitiveDataAccess,
  requireAuditLogAccess,
  requireSystemConfigAccess,
  rbacLogger,
};
