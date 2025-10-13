// src/constants/roles.js
/**
 * HẰNG SỐ VAI TRÒ VÀ QUYỀN TRONG HỆ THỐNG
 * Định nghĩa các role và permission cho hệ thống Role-Based Access Control (RBAC)
 */

module.exports = {
  // ĐỊNH NGHĨA CÁC VAI TRÒ TRONG HỆ THỐNG
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',    // Quản trị viên cấp cao nhất - toàn quyền hệ thống
    ADMIN: 'ADMIN',                // Quản trị viên - quản lý hệ thống
    MANAGER: 'MANAGER',            // Quản lý - quản lý nhân sự và hoạt động
    DOCTOR: 'DOCTOR',              // Bác sĩ - thực hiện khám chữa bệnh
    STAFF: 'STAFF',                // Nhân viên - hỗ trợ nghiệp vụ
    PATIENT: 'PATIENT',            // Bệnh nhân - người sử dụng dịch vụ
  },

  // ĐỊNH NGHĨA CÁC QUYỀN CHI TIẾT TRONG HỆ THỐNG
  PERMISSIONS: {
    // Quyền tạo người dùng theo từng vai trò
    CREATE_ADMIN: 'CREATE_ADMIN',
    CREATE_MANAGER: 'CREATE_MANAGER',
    CREATE_DOCTOR: 'CREATE_DOCTOR',
    CREATE_STAFF: 'CREATE_STAFF',
    CREATE_PATIENT: 'CREATE_PATIENT',
    
    // Quyền đọc và cập nhật thông tin người dùng
    READ_ANY_USER: 'READ_ANY_USER',
    UPDATE_ANY_USER: 'UPDATE_ANY_USER',
    
    // Quyền xem nhật ký kiểm tra
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    
    // Có thể thêm các quyền khác khi cần
  },

  // ÁNH XẠ VAI TRÒ VỚI CÁC QUYỀN TƯƠNG ỨNG
  ROLE_PERMISSIONS: {
    SUPER_ADMIN: [
      'CREATE_ADMIN', 'CREATE_MANAGER', 'CREATE_DOCTOR', 'CREATE_STAFF', 'CREATE_PATIENT',
      'READ_ANY_USER', 'UPDATE_ANY_USER', 'VIEW_AUDIT_LOGS'
    ],
    ADMIN: [
      'CREATE_MANAGER', 'CREATE_DOCTOR', 'CREATE_STAFF', 'CREATE_PATIENT', 'READ_ANY_USER'
    ],
    MANAGER: [
      'CREATE_DOCTOR', 'CREATE_STAFF', 'READ_ANY_USER'
    ],
    DOCTOR: [
      'READ_ANY_USER'
    ],
    STAFF: [],      // Nhân viên không có quyền đặc biệt
    PATIENT: [],    // Bệnh nhân không có quyền đặc biệt
  }
};