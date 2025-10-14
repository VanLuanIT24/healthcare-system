// src/middlewares/auth.middleware.js
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { ROLES, hasPermission } = require('../constants/roles');

/**
 * Middleware xác thực JWT và RBAC
 */
async function authenticate(req, res, next) {
  // Bỏ qua nếu route là public
  if (req.isPublic) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header là bắt buộc' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Định dạng token không hợp lệ' });
  }

  const token = parts[1];

  try {
    const payload = verifyAccessToken(token);
    
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Tài khoản không hoạt động' });
    }

    // Gắn thông tin user đầy đủ với permissions
    req.user = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      canCreate: user.canCreate || [],
      permissions: payload.permissions || [],
    };

    next();

  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

/**
 * Middleware kiểm tra permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yêu cầu xác thực' });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        error: 'Không có quyền thực hiện hành động này' 
      });
    }

    next();
  };
}

/**
 * Middleware kiểm tra role
 */
function requireRole(roles) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yêu cầu xác thực' });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Không có quyền truy cập tài nguyên này' 
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
};