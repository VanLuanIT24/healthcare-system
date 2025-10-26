// src/middlewares/auth.middleware.js
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { ROLES, hasPermission, ROLE_PERMISSIONS } = require('../constants/roles');
const { AppError, ERROR_CODES } = require('./error.middleware');

/**
 * 🛡️ MIDDLEWARE XÁC THỰC JWT VÀ RBAC CHO HEALTHCARE SYSTEM
 * - Xác thực JWT token và tải thông tin người dùng
 * - Kiểm tra trạng thái tài khoản
 * - Gắn thông tin permissions vào request
 */

/**
 * MIDDLEWARE XÁC THỰC CHÍNH
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH MIDDLEWARE] Starting authentication...');
    console.log('🔐 [AUTH MIDDLEWARE] Headers:', req.headers);
    
    // 🎯 LẤY TOKEN TỪ HEADER
    const authHeader = req.headers.authorization;
    console.log('🔐 [AUTH MIDDLEWARE] Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH MIDDLEWARE] No Bearer token found');
      return next(new AppError('Token không tồn tại', 401, 'AUTH_NO_TOKEN'));
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('🔐 [AUTH MIDDLEWARE] Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');

    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ [AUTH MIDDLEWARE] Empty or invalid token');
      return next(new AppError('Token không hợp lệ', 401, 'AUTH_INVALID_TOKEN'));
    }

    // 🎯 XÁC THỰC TOKEN
    try {
      const payload = verifyAccessToken(token);
      console.log('✅ [AUTH MIDDLEWARE] Token verified. Payload:', {
        userId: payload.sub,
        role: payload.role,
        email: payload.email
      });

      // 🎯 TÌM USER TRONG DATABASE ĐỂ ĐẢM BẢO TỒN TẠI
      const user = await User.findById(payload.sub)
        .select('-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil');
      
      if (!user) {
        console.log('❌ [AUTH MIDDLEWARE] User not found in database');
        return next(new AppError('Người dùng không tồn tại', 401, 'AUTH_USER_NOT_FOUND'));
      }

      // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      if (user.status !== 'ACTIVE') {
        console.log('❌ [AUTH MIDDLEWARE] User account not active:', user.status);
        return next(new AppError('Tài khoản không hoạt động', 403, 'AUTH_ACCOUNT_INACTIVE'));
      }

      // 🎯 GẮN USER VÀO REQUEST
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        personalInfo: user.personalInfo
      };

      console.log('✅ [AUTH MIDDLEWARE] User attached to request:', {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      });

      next();

    } catch (tokenError) {
      console.error('❌ [AUTH MIDDLEWARE] Token verification failed:', tokenError.message);
      return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 401, 'AUTH_INVALID_TOKEN'));
    }

  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] Unexpected error:', error);
    next(error);
  }
};

/**
 * 🛡️ AUTHORIZATION MIDDLEWARE
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 [AUTHORIZE MIDDLEWARE] Checking roles:', roles);
    console.log('🔐 [AUTHORIZE MIDDLEWARE] User role:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ [AUTHORIZE MIDDLEWARE] No user found');
      return next(new AppError('Không tìm thấy thông tin người dùng', 401));
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ [AUTHORIZE MIDDLEWARE] Insufficient permissions');
      return next(new AppError('Không có quyền truy cập', 403));
    }

    console.log('✅ [AUTHORIZE MIDDLEWARE] Role authorized');
    next();
  };
};

/**
 * 🎯 MIDDLEWARE KIỂM TRA PERMISSION
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(new AppError(
        'Không có quyền thực hiện hành động này', 
        403, 
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA ROLE
 */
function requireRole(roles) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    if (!roleArray.includes(req.user.role)) {
      return next(new AppError(
        'Không có quyền truy cập tài nguyên này', 
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
function requirePatientAccess(patientIdField = 'patientId') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    const patientId = req.params[patientIdField] || req.body[patientIdField] || req.query[patientIdField];
    
    // 🎯 BÁC SĨ, Y TÁ, QUẢN TRỊ ĐƯỢC TRUY CẬP TẤT CẢ
    const canAccessAll = ['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_HEAD'].includes(req.user.role);
    
    // 🎯 BỆNH NHÂN CHỈ ĐƯỢC TRUY CẬP DỮ LIỆU CỦA CHÍNH MÌNH
    if (req.user.role === 'PATIENT' && patientId !== req.user._id.toString()) {
      return next(new AppError(
        'Bạn chỉ được xem dữ liệu của chính mình',
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    // 🎯 NHÂN VIÊN HÀNH CHÍNH CÓ QUYỀN HẠN CHẾ
    const restrictedRoles = ['RECEPTIONIST', 'BILLING_STAFF'];
    if (restrictedRoles.includes(req.user.role) && !hasPermission(req.user.role, 'MEDICAL.VIEW_RECORDS')) {
      return next(new AppError(
        'Không có quyền truy cập dữ liệu bệnh nhân',
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    next();
  };
}

/**
 * 🎯 MIDDLEWARE KIỂM TRA QUYỀN TRONG TÌNH HUỐNG KHẨN CẤP
 */
function allowEmergencyAccess() {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Yêu cầu xác thực', 401, ERROR_CODES.AUTH_INVALID_TOKEN));
    }

    // 🎯 KIỂM TRA HEADER KHẨN CẤP
    const isEmergency = req.headers['x-emergency-access'] === 'true';
    
    if (isEmergency && !hasPermission(req.user.role, 'EMERGENCY.ACCESS')) {
      return next(new AppError(
        'Không có quyền truy cập khẩn cấp',
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
      ));
    }

    // 🎯 GẮN CỜ KHẨN CẤP VÀO REQUEST
    req.isEmergency = isEmergency;
    next();
  };
}

/**
 * 🎯 HÀM HỖ TRỢ: THÔNG BÁO TRẠNG THÁI TÀI KHOẢN
 */
function getAccountStatusMessage(status) {
  const messages = {
    ACTIVE: 'Tài khoản đang hoạt động',
    INACTIVE: 'Tài khoản chưa được kích hoạt',
    SUSPENDED: 'Tài khoản đã bị tạm ngưng',
    LOCKED: 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần',
    PENDING_APPROVAL: 'Tài khoản đang chờ phê duyệt',
  };
  
  return messages[status] || 'Tài khoản không hoạt động';
}

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
  requirePatientAccess,
  allowEmergencyAccess,
  authorize,
};