// src/constants/roles.js
/**
 * 🌐 HỆ THỐNG PHÂN QUYỀN RBAC CHUẨN ENTERPRISE CHO AUTH MODULE
 * Author: Senior Dev Team (Enterprise Edition)
 * Description:
 *  - Thiết kế hướng bảo mật và mở rộng
 *  - Dùng cho Đăng nhập, Đăng ký, Quản lý tài khoản
 */

const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',  // Toàn quyền hệ thống (God-level)
  ADMIN: 'ADMIN',              // Quản trị viên (quản lý người dùng, bác sĩ, nhân viên)
  MANAGER: 'MANAGER',          // Quản lý bộ phận (có thể tạo/staff)
  DOCTOR: 'DOCTOR',            // Bác sĩ (có thể tạo bệnh nhân)
  STAFF: 'STAFF',              // Nhân viên hỗ trợ
  PATIENT: 'PATIENT',          // Bệnh nhân (người dùng cuối)
  GUEST: 'GUEST',              // Chưa đăng nhập
});

const PERMISSIONS = Object.freeze({
  // ===== AUTHENTICATION =====
  LOGIN: 'AUTH.LOGIN',                     // Đăng nhập
  LOGOUT: 'AUTH.LOGOUT',                   // Đăng xuất
  SELF_REGISTER: 'AUTH.SELF_REGISTER',     // Đăng ký tài khoản cho chính mình
  REGISTER_PATIENT: 'AUTH.REGISTER_PATIENT',
  REGISTER_STAFF: 'AUTH.REGISTER_STAFF',
  REGISTER_DOCTOR: 'AUTH.REGISTER_DOCTOR',
  REGISTER_MANAGER: 'AUTH.REGISTER_MANAGER',
  REGISTER_ADMIN: 'AUTH.REGISTER_ADMIN',

  // ===== USER MANAGEMENT =====
  VIEW_USER: 'USER.VIEW',
  UPDATE_USER: 'USER.UPDATE',
  DISABLE_USER: 'USER.DISABLE',
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_ADMIN,
    PERMISSIONS.REGISTER_MANAGER,
    PERMISSIONS.REGISTER_DOCTOR,
    PERMISSIONS.REGISTER_STAFF,
    PERMISSIONS.REGISTER_PATIENT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DISABLE_USER,
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_MANAGER,
    PERMISSIONS.REGISTER_DOCTOR,
    PERMISSIONS.REGISTER_STAFF,
    PERMISSIONS.REGISTER_PATIENT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.UPDATE_USER,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_DOCTOR,
    PERMISSIONS.REGISTER_STAFF,
    PERMISSIONS.REGISTER_PATIENT,
    PERMISSIONS.VIEW_USER,
  ],

  [ROLES.DOCTOR]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_PATIENT,
    PERMISSIONS.VIEW_USER,
  ],

  [ROLES.STAFF]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_PATIENT,
  ],

  [ROLES.PATIENT]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.LOGOUT,
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.LOGIN,
    PERMISSIONS.SELF_REGISTER, // khách tự đăng ký tài khoản bệnh nhân
  ],
});

/**
 * ===== 🧩 HÀM HỖ TRỢ KIỂM TRA QUYỀN =====
 * Kiểm tra xem vai trò có quyền thực hiện hành động nào đó không
 * Có xử lý an toàn khi role hoặc permission không hợp lệ
 * @param {string} role - Vai trò người dùng
 * * @param {string} permission - Quyền cần kiểm tra
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

/**
 * ===== ⚡ VALIDATION LOGIC =====
 * Đảm bảo người dùng chỉ có thể tạo tài khoản cấp thấp hơn mình
 */
function canCreateRole(currentRole, targetRole) {
  const hierarchy = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.DOCTOR,
    ROLES.STAFF,
    ROLES.PATIENT,
    ROLES.GUEST,
  ];

  const currentIndex = hierarchy.indexOf(currentRole);
  const targetIndex = hierarchy.indexOf(targetRole);

  // Không được tạo cùng cấp hoặc cấp cao hơn
  return currentIndex >= 0 && targetIndex > currentIndex;
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canCreateRole,
};