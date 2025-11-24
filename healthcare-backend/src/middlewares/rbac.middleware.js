// src/middlewares/rbac.middleware
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
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      console.log('🔐 [RBAC] Checking permission:', {
        userId: req.user?._id,
        userRole: req.user?.role,
        requiredPermission: permission,
        path: req.path,
        method: req.method
      });

      // Kiểm tra user đã được xác thực
      if (!req.user) {
        console.error('❌ [RBAC] No user found in request');
        throw new AppError('Không tìm thấy thông tin xác thực', 401, 'UNAUTHORIZED');
      }

      const userRole = req.user.role;
      
      // SUPER_ADMIN có toàn quyền
      if (userRole === 'SUPER_ADMIN') {
        console.log('✅ [RBAC] SUPER_ADMIN - Bypass all permissions');
        return next();
      }

      // Kiểm tra permission
      if (!hasPermission(userRole, permission)) {
        console.error('❌ [RBAC] Permission denied:', {
          userRole,
          requiredPermission: permission,
          availablePermissions: ROLE_PERMISSIONS[userRole]
        });
        
        throw new AppError(
          'Bạn không có quyền thực hiện hành động này', 
          403, 
          'FORBIDDEN'
        );
      }

      console.log('✅ [RBAC] Permission granted');
      next();
    } catch (error) {
      next(error);
    }
  };
};

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

const requireAnyPermission = (permissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Không tìm thấy thông tin xác thực', 401, 'UNAUTHORIZED');
      }

      const userRole = req.user.role;
      
      // SUPER_ADMIN có toàn quyền
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Kiểm tra nếu có ít nhất một permission
      const hasAnyPermission = permissions.some(permission => 
        hasPermission(userRole, permission)
      );

      if (!hasAnyPermission) {
        throw new AppError(
          'Bạn không có quyền thực hiện hành động này', 
          403, 
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const requireAllPermissions = (permissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Không tìm thấy thông tin xác thực', 401, 'UNAUTHORIZED');
      }

      const userRole = req.user.role;
      
      // SUPER_ADMIN có toàn quyền
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Kiểm tra nếu có tất cả permissions
      const hasAllPermissions = permissions.every(permission => 
        hasPermission(userRole, permission)
      );

      if (!hasAllPermissions) {
        throw new AppError(
          'Bạn không có đủ quyền để thực hiện hành động này', 
          403, 
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra role hierarchy
 * Cho phép user có role cao hơn truy cập tài nguyên của role thấp hơn
 */
const requireHigherRole = (targetRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Không tìm thấy thông tin xác thực', 401, 'UNAUTHORIZED');
      }

      const userRole = req.user.role;
      const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
      const targetRoleIndex = ROLE_HIERARCHY.indexOf(targetRole);

      if (userRoleIndex === -1 || targetRoleIndex === -1) {
        throw new AppError('Role không hợp lệ', 400, 'INVALID_ROLE');
      }

      // SUPER_ADMIN có toàn quyền
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Kiểm tra nếu user role cao hơn target role
      if (userRoleIndex > targetRoleIndex) {
        throw new AppError(
          'Bạn không có quyền truy cập tài nguyên này', 
          403, 
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra quyền sở hữu hoặc permission
 * Cho phép user truy cập tài nguyên của chính họ hoặc có permission
 */
const requireOwnershipOrPermission = (permission, idField = '_id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Không tìm thấy thông tin xác thực', 401, 'UNAUTHORIZED');
      }

      const userRole = req.user.role;
      const userId = req.user._id.toString();
      const resourceId = req.params[idField] || req.body[idField];

      // SUPER_ADMIN có toàn quyền
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Cho phép truy cập nếu là tài nguyên của chính họ
      if (resourceId && userId === resourceId) {
        console.log('✅ [RBAC] Ownership access granted');
        return next();
      }

      // Kiểm tra permission
      if (!hasPermission(userRole, permission)) {
        throw new AppError(
          'Bạn không có quyền thực hiện hành động này', 
          403, 
          'FORBIDDEN'
        );
      }

      console.log('✅ [RBAC] Permission-based access granted');
      next();
    } catch (error) {
      next(error);
    }
  };
};

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
  requireAnyPermission,
  requireAllPermissions,
  requireHigherRole,
  requireOwnershipOrPermission,
};
