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
async function authenticate(req, res, next) {
  try {
    // 🎯 BỎ QUA NẾU ROUTE LÀ PUBLIC
    if (req.isPublic) {
      return next();
    }

    // 🎯 KIỂM TRA AUTHORIZATION HEADER
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('Authorization header là bắt buộc', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    // 🎯 KIỂM TRA ĐỊNH DẠNG TOKEN
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Định dạng token không hợp lệ. Sử dụng: Bearer <token>', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    const token = parts[1];

    // 🎯 XÁC THỰC TOKEN
    const payload = verifyAccessToken(token);
    
    // 🎯 TẢI THÔNG TIN NGƯỜI DÙNG TỪ DATABASE
    const user = await User.findById(payload.sub)
      .select('-passwordHash -refreshTokens')
      .lean();
    
    if (!user) {
      throw new AppError('Người dùng không tồn tại', 401, ERROR_CODES.AUTH_INVALID_TOKEN);
    }

    // 🎯 KIỂM TRA TRẠNG THÁI TÀI KHOẢN
    if (user.status !== 'ACTIVE') {
      const errorMessage = getAccountStatusMessage(user.status);
      throw new AppError(errorMessage, 403, ERROR_CODES.AUTH_ACCOUNT_LOCKED);
    }

    // 🎯 LẤY DANH SÁCH PERMISSIONS THEO ROLE
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // 🎯 GẮN THÔNG TIN USER ĐẦY ĐỦ VÀO REQUEST
    req.user = {
      _id: user._id,
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      status: user.status,
      permissions: userPermissions,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    // 🎯 LOG HOẠT ĐỘNG ĐĂNG NHẬP THÀNH CÔNG
    console.log(`🔐 User authenticated: ${user.email} (${user.role})`);

    next();

  } catch (error) {
    // 🎯 XỬ LÝ LỖI XÁC THỰC
    if (error instanceof AppError) {
      return next(error);
    }
    
    // 🎯 LỖI TỪ JWT HOẶC DATABASE
    const authError = new AppError(
      error.message || 'Token không hợp lệ',
      401,
      ERROR_CODES.AUTH_INVALID_TOKEN
    );
    next(authError);
  }
}

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
    INACTIVE: 'Tài khoản chưa được kích hoạt',
    SUSPENDED: 'Tài khoản đã bị tạm ngưng',
    LOCKED: 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần',
    PENDING: 'Tài khoản đang chờ phê duyệt',
    EXPIRED: 'Tài khoản đã hết hạn',
  };
  
  return messages[status] || 'Tài khoản không hoạt động';
}

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
  requirePatientAccess,
  allowEmergencyAccess,
};