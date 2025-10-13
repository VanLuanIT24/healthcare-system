// src/middlewares/rbac.middleware.js
const { ROLE_PERMISSIONS } = require('../constants/roles');

/**
 * MIDDLEWARE KIỂM TRA VAI TRÒ NGƯỜI DÙNG
 * - Xác thực user có vai trò được phép truy cập endpoint
 * 
 * @param {...string} allowedRoles - Danh sách vai trò được phép
 * @returns {Function} Middleware function
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    
    // 🔹 KIỂM TRA USER ĐÃ ĐƯỢC XÁC THỰC
    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }

    // 🔹 KIỂM TRA VAI TRÒ CÓ ĐƯỢC PHÉP
    if (!allowedRoles.includes(user.role) && !allowedRoles.includes('ANY')) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    next(); // User có quyền hợp lệ
  };
}

/**
 * MIDDLEWARE KIỂM TRA QUYỀN CỤ THỂ
 * - Xác thực user có permission cần thiết
 * 
 * @param {string} permission - Permission cần kiểm tra
 * @returns {Function} Middleware function
 */
function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user;
    
    // 🔹 KIỂM TRA USER ĐÃ ĐƯỢC XÁC THỰC
    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }

    // 🔹 LẤY DANH SÁCH QUYỀN THEO VAI TRÒ
    const perms = ROLE_PERMISSIONS[user.role] || [];
    
    // 🔹 KIỂM TRA QUYỀN CÓ TỒN TẠI
    if (!perms.includes(permission)) {
      return res.status(403).json({ error: 'Không có quyền thực hiện hành động này' });
    }

    next(); // User có permission hợp lệ
  };
}

module.exports = { requireRole, requirePermission };