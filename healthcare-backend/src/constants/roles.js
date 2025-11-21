// src/constants/roles.js
/**
 *  HỆ THỐNG PHÂN QUYỀN RBAC CHUẨN HEALTHCARE ENTERPRISE
 * Author: Senior Dev Team (Healthcare Edition)
 * Description:
 *  - Thiết kế chuyên biệt cho hệ thống y tế
 *  - Hỗ trợ đa dạng vai trò và quyền hạn theo chuẩn bệnh viện
 *  - Bảo mật dữ liệu bệnh nhân theo HIPAA và các tiêu chuẩn y tế
 */

const ROLES = Object.freeze({
  // ===== HỆ THỐNG =====
  SUPER_ADMIN: 'SUPER_ADMIN',        // Toàn quyền hệ thống (IT System Admin)
  
  // ===== QUẢN TRỊ =====
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',  // Quản trị bệnh viện
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD', // Trưởng khoa/phòng
  
  // ===== Y BÁC SĨ =====
  DOCTOR: 'DOCTOR',                  // Bác sĩ điều trị
  NURSE: 'NURSE',                    // Y tá/Điều dưỡng
  PHARMACIST: 'PHARMACIST',          // Dược sĩ
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',  // Kỹ thuật viên xét nghiệm
  
  // ===== HÀNH CHÍNH =====
  RECEPTIONIST: 'RECEPTIONIST',      // Lễ tân
  BILLING_STAFF: 'BILLING_STAFF',    // Nhân viên kế toán
  
  // ===== NGƯỜI DÙNG =====
  PATIENT: 'PATIENT',                // Bệnh nhân
  GUEST: 'GUEST',                    // Khách (chưa đăng nhập)
});

const PERMISSIONS = Object.freeze({
  // ===== AUTHENTICATION & CƠ BẢN =====
  LOGIN: 'AUTH.LOGIN',
  LOGOUT: 'AUTH.LOGOUT',
  SELF_REGISTER: 'AUTH.SELF_REGISTER',
  
  // ===== ĐĂNG KÝ TÀI KHOẢN =====
  REGISTER_PATIENT: 'AUTH.REGISTER_PATIENT',
  REGISTER_RECEPTIONIST: 'AUTH.REGISTER_RECEPTIONIST',
  REGISTER_BILLING_STAFF: 'AUTH.REGISTER_BILLING_STAFF',
  REGISTER_LAB_TECHNICIAN: 'AUTH.REGISTER_LAB_TECHNICIAN',
  REGISTER_PHARMACIST: 'AUTH.REGISTER_PHARMACIST',
  REGISTER_NURSE: 'AUTH.REGISTER_NURSE',
  REGISTER_DOCTOR: 'AUTH.REGISTER_DOCTOR',
  REGISTER_DEPARTMENT_HEAD: 'AUTH.REGISTER_DEPARTMENT_HEAD',
  REGISTER_HOSPITAL_ADMIN: 'AUTH.REGISTER_HOSPITAL_ADMIN',

  // ===== QUẢN LÝ NGƯỜI DÙNG =====
  VIEW_USER: 'USER.VIEW',
  UPDATE_USER: 'USER.UPDATE',
  DISABLE_USER: 'USER.DISABLE',
  VIEW_USER_SENSITIVE: 'USER.VIEW_SENSITIVE', // Xem thông tin nhạy cảm

  // ===== HỒ SƠ BỆNH ÁN ===== (Quan trọng nhất)
  VIEW_MEDICAL_RECORDS: 'MEDICAL.VIEW_RECORDS',
  CREATE_MEDICAL_RECORDS: 'MEDICAL.CREATE_RECORDS',
  UPDATE_MEDICAL_RECORDS: 'MEDICAL.UPDATE_RECORDS',
  DELETE_MEDICAL_RECORDS: 'MEDICAL.DELETE_RECORDS',
  EXPORT_MEDICAL_RECORDS: 'MEDICAL.EXPORT_RECORDS',
  
  // ===== CHẨN ĐOÁN & ĐIỀU TRỊ =====
  CREATE_DIAGNOSIS: 'MEDICAL.CREATE_DIAGNOSIS',
  UPDATE_DIAGNOSIS: 'MEDICAL.UPDATE_DIAGNOSIS',
  VIEW_TREATMENT_PLANS: 'MEDICAL.VIEW_TREATMENT_PLANS',
  CREATE_TREATMENT_PLANS: 'MEDICAL.CREATE_TREATMENT_PLANS',
  UPDATE_TREATMENT_PLANS: 'MEDICAL.UPDATE_TREATMENT_PLANS',

  // ===== ĐƠN THUỐC =====
  VIEW_PRESCRIPTIONS: 'PRESCRIPTION.VIEW',
  CREATE_PRESCRIPTIONS: 'PRESCRIPTION.CREATE',
  UPDATE_PRESCRIPTIONS: 'PRESCRIPTION.UPDATE',
  DISPENSE_MEDICATION: 'PRESCRIPTION.DISPENSE', // Phát thuốc

  // ===== LỊCH HẸN =====
  VIEW_APPOINTMENTS: 'APPOINTMENT.VIEW',
  CREATE_APPOINTMENTS: 'APPOINTMENT.CREATE',
  UPDATE_APPOINTMENTS: 'APPOINTMENT.UPDATE',
  CANCEL_APPOINTMENTS: 'APPOINTMENT.CANCEL',
  VIEW_SCHEDULE: 'APPOINTMENT.VIEW_SCHEDULE', // Lịch làm việc

  // ===== XÉT NGHIỆM & CẬN LÂM SÀNG =====
  VIEW_LAB_RESULTS: 'LAB.VIEW_RESULTS',
  CREATE_LAB_RESULTS: 'LAB.CREATE_RESULTS',
  UPDATE_LAB_RESULTS: 'LAB.UPDATE_RESULTS',
  APPROVE_LAB_RESULTS: 'LAB.APPROVE_RESULTS',

  // ===== THANH TOÁN & HÓA ĐƠN =====
  VIEW_BILLS: 'BILL.VIEW',
  CREATE_BILLS: 'BILL.CREATE',
  UPDATE_BILLS: 'BILL.UPDATE',
  PROCESS_PAYMENTS: 'BILL.PROCESS_PAYMENTS',
  VIEW_FINANCIAL_REPORTS: 'BILL.VIEW_REPORTS',

  // ===== QUẢN LÝ KHO =====
  VIEW_INVENTORY: 'INVENTORY.VIEW',
  UPDATE_INVENTORY: 'INVENTORY.UPDATE',
  MANAGE_MEDICATION_STOCK: 'INVENTORY.MANAGE_MEDICATION',

  // ===== BÁO CÁO & THỐNG KÊ =====
  VIEW_REPORTS: 'REPORT.VIEW',
  GENERATE_REPORTS: 'REPORT.GENERATE',
  EXPORT_REPORTS: 'REPORT.EXPORT',

  // ===== QUYỀN KHẨN CẤP ===== (Y tế đặc thù)
  EMERGENCY_ACCESS: 'EMERGENCY.ACCESS', // Truy cập khẩn trong tình huống cấp cứu
  BYPASS_APPROVAL: 'EMERGENCY.BYPASS_APPROVAL',

  // ===== HỆ THỐNG =====
  SYSTEM_CONFIG: 'SYSTEM.CONFIG',
  AUDIT_LOG_VIEW: 'SYSTEM.VIEW_AUDIT_LOG',
});

/**
 *  PHÂN QUYỀN CHI TIẾT THEO VAI TRÒ
 * - Mỗi role có tập permissions phù hợp với công việc
 * - Tuân thủ nguyên tắc "least privilege" trong bảo mật y tế
 */
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: [
    // Toàn quyền hệ thống
    ...Object.values(PERMISSIONS)
  ],

  [ROLES.HOSPITAL_ADMIN]: [
    // Quản trị bệnh viện
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_DEPARTMENT_HEAD, PERMISSIONS.REGISTER_DOCTOR,
    PERMISSIONS.REGISTER_NURSE, PERMISSIONS.REGISTER_PHARMACIST,
    PERMISSIONS.REGISTER_LAB_TECHNICIAN, PERMISSIONS.REGISTER_BILLING_STAFF,
    PERMISSIONS.REGISTER_RECEPTIONIST,
    PERMISSIONS.VIEW_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DISABLE_USER,
    PERMISSIONS.VIEW_USER_SENSITIVE,
    PERMISSIONS.VIEW_MEDICAL_RECORDS, PERMISSIONS.EXPORT_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_APPOINTMENTS, PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_LAB_RESULTS, PERMISSIONS.VIEW_BILLS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS, PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS, PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.EMERGENCY_ACCESS, PERMISSIONS.AUDIT_LOG_VIEW,
  ],

  [ROLES.DEPARTMENT_HEAD]: [
    // Trưởng khoa
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_DOCTOR, PERMISSIONS.REGISTER_NURSE,
    PERMISSIONS.REGISTER_LAB_TECHNICIAN,
    PERMISSIONS.VIEW_USER, PERMISSIONS.UPDATE_USER,
    PERMISSIONS.VIEW_MEDICAL_RECORDS, PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.UPDATE_MEDICAL_RECORDS, PERMISSIONS.EXPORT_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_DIAGNOSIS, PERMISSIONS.UPDATE_DIAGNOSIS,
    PERMISSIONS.VIEW_TREATMENT_PLANS, PERMISSIONS.CREATE_TREATMENT_PLANS,
    PERMISSIONS.UPDATE_TREATMENT_PLANS,
    PERMISSIONS.VIEW_PRESCRIPTIONS, PERMISSIONS.CREATE_PRESCRIPTIONS,
    PERMISSIONS.VIEW_APPOINTMENTS, PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_APPOINTMENTS, PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_LAB_RESULTS, PERMISSIONS.APPROVE_LAB_RESULTS,
    PERMISSIONS.VIEW_REPORTS, PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EMERGENCY_ACCESS,
  ],

  [ROLES.DOCTOR]: [
    // Bác sĩ điều trị
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_MEDICAL_RECORDS, PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.UPDATE_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_DIAGNOSIS, PERMISSIONS.UPDATE_DIAGNOSIS,
    PERMISSIONS.VIEW_TREATMENT_PLANS, PERMISSIONS.CREATE_TREATMENT_PLANS,
    PERMISSIONS.UPDATE_TREATMENT_PLANS,
    PERMISSIONS.VIEW_PRESCRIPTIONS, PERMISSIONS.CREATE_PRESCRIPTIONS,
    PERMISSIONS.UPDATE_PRESCRIPTIONS,
    PERMISSIONS.VIEW_APPOINTMENTS, PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_APPOINTMENTS, PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_LAB_RESULTS, PERMISSIONS.CREATE_LAB_RESULTS,
    PERMISSIONS.EMERGENCY_ACCESS,
  ],

  [ROLES.NURSE]: [
    // Y tá/Điều dưỡng
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_MEDICAL_RECORDS, PERMISSIONS.UPDATE_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_TREATMENT_PLANS, PERMISSIONS.UPDATE_TREATMENT_PLANS,
    PERMISSIONS.VIEW_PRESCRIPTIONS, PERMISSIONS.DISPENSE_MEDICATION,
    PERMISSIONS.VIEW_APPOINTMENTS, PERMISSIONS.UPDATE_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_LAB_RESULTS, PERMISSIONS.CREATE_LAB_RESULTS,
    PERMISSIONS.EMERGENCY_ACCESS,
  ],

  [ROLES.PHARMACIST]: [
    // Dược sĩ
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_PRESCRIPTIONS, PERMISSIONS.DISPENSE_MEDICATION,
    PERMISSIONS.VIEW_INVENTORY, PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.MANAGE_MEDICATION_STOCK,
  ],

  [ROLES.LAB_TECHNICIAN]: [
    // Kỹ thuật viên xét nghiệm
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_LAB_RESULTS, PERMISSIONS.CREATE_LAB_RESULTS,
    PERMISSIONS.UPDATE_LAB_RESULTS,
  ],

  [ROLES.RECEPTIONIST]: [
    // Lễ tân
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.REGISTER_PATIENT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_APPOINTMENTS, PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_APPOINTMENTS, PERMISSIONS.CANCEL_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
  ],

  [ROLES.BILLING_STAFF]: [
    // Nhân viên kế toán
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_USER,
    PERMISSIONS.VIEW_BILLS, PERMISSIONS.CREATE_BILLS,
    PERMISSIONS.UPDATE_BILLS, PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  ],

  [ROLES.PATIENT]: [
    // Bệnh nhân
    PERMISSIONS.LOGIN, PERMISSIONS.LOGOUT,
    PERMISSIONS.VIEW_MEDICAL_RECORDS, // Chỉ xem của bản thân
    PERMISSIONS.VIEW_PRESCRIPTIONS,   // Chỉ xem của bản thân
    PERMISSIONS.VIEW_APPOINTMENTS,    // Chỉ xem của bản thân
    PERMISSIONS.CREATE_APPOINTMENTS,  // Đặt lịch hẹn
    PERMISSIONS.CANCEL_APPOINTMENTS,  // Hủy lịch của bản thân
    PERMISSIONS.VIEW_BILLS,           // Chỉ xem của bản thân
  ],

  [ROLES.GUEST]: [
    // Khách (chưa đăng nhập)
    PERMISSIONS.LOGIN,
    PERMISSIONS.SELF_REGISTER,        // Tự đăng ký tài khoản bệnh nhân
  ],
});

/**
 *  HIERARCHY CHUẨN Y TẾ
 * - Thứ tự từ cao xuống thấp
 * - Phản ánh cơ cấu tổ chức bệnh viện thực tế
 */
const ROLE_HIERARCHY = Object.freeze([
  ROLES.SUPER_ADMIN,          // Cấp cao nhất
  ROLES.HOSPITAL_ADMIN,       // Quản trị bệnh viện
  ROLES.DEPARTMENT_HEAD,      // Trưởng khoa
  ROLES.DOCTOR,               // Bác sĩ
  ROLES.PHARMACIST,           // Dược sĩ
  ROLES.NURSE,                // Y tá
  ROLES.LAB_TECHNICIAN,       // Kỹ thuật viên
  ROLES.BILLING_STAFF,        // Kế toán
  ROLES.RECEPTIONIST,         // Lễ tân
  ROLES.PATIENT,              // Bệnh nhân
  ROLES.GUEST,                // Khách
]);

/**
 *  HÀM HỖ TRỢ KIỂM TRA QUYỀN
 * Kiểm tra xem vai trò có quyền thực hiện hành động không
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

/**
 *  KIỂM TRA QUYỀN TẠO ROLE
 * Đảm bảo người dùng chỉ có thể tạo tài khoản cấp thấp hơn
 */
function canCreateRole(currentRole, targetRole) {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
<<<<<<< Updated upstream

  // Không được tạo cùng cấp hoặc cấp cao hơn
  return currentIndex >= 0 && targetIndex > currentIndex;
=======
  if (currentIndex < 0 || targetIndex < 0) return false;
  // SUPER_ADMIN có thể tạo mọi role (trừ chính nó trong logic khác)
  if (currentRole === ROLES.SUPER_ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }
  // HOSPITAL_ADMIN có thể tạo DEPARTMENT_HEAD, DOCTOR và các role thấp hơn
  if (currentRole === ROLES.HOSPITAL_ADMIN) {
    return targetIndex >= 2; // Từ DEPARTMENT_HEAD trở xuống
  }
  // DEPARTMENT_HEAD có thể tạo DOCTOR, NURSE, LAB_TECHNICIAN
  if (currentRole === ROLES.DEPARTMENT_HEAD) {
    return [ROLES.DOCTOR, ROLES.NURSE, ROLES.LAB_TECHNICIAN].includes(targetRole);
  }
  // Mặc định: không được tạo cùng cấp hoặc cao hơn
  return targetIndex > currentIndex;
>>>>>>> Stashed changes
}
/**
 * KIỂM TRA QUYỀN TRUY CẬP DỮ LIỆU BỆNH NHÂN
 * Quan trọng: Tuân thủ HIPAA và bảo vệ quyền riêng tư
 */
function canAccessPatientData(userRole, patientId, accessorId, isEmergency = false) {
  // TRƯỜNG HỢP KHẨN CẤP: Cho phép truy cập
  if (isEmergency && hasPermission(userRole, PERMISSIONS.EMERGENCY_ACCESS)) {
    return true;
  }
  // 👤 BỆNH NHÂN: Chỉ xem dữ liệu của chính mình
  if (userRole === ROLES.PATIENT) {
    return patientId === accessorId;
  }
  // NHÂN VIÊN Y TẾ: Được xem theo phân quyền
  const medicalStaff = [
    ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, 
    ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN
  ];
  if (medicalStaff.includes(userRole)) {
    return hasPermission(userRole, PERMISSIONS.VIEW_MEDICAL_RECORDS);
  }
  return false;
}
/**
 *  LẤY DANH SÁCH ROLE CÓ THỂ TẠO
 */
function getCreatableRoles(currentRole) {
  return ROLE_HIERARCHY.filter(targetRole => canCreateRole(currentRole, targetRole));
}

/**
 * KIỂM TRA QUYỀN THEO MODULE
 */
function hasModuleAccess(role, module) {
  const modulePermissions = Object.values(PERMISSIONS).filter(p => 
    p.startsWith(`${module}.`)
  );
  return modulePermissions.some(permission => hasPermission(role, permission));
}
<<<<<<< Updated upstream

=======
/**
 * LẤY DANH SÁCH PERMISSIONS THEO ROLE
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}
/**
 *  KIỂM TRA QUYỀN QUẢN LÝ USER
 */
function canManageUser(currentRole, targetRole) {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);

  if (currentIndex < 0 || targetIndex < 0) return false;
  // SUPER_ADMIN có thể quản lý mọi role (trừ chính nó trong logic khác)
  if (currentRole === ROLES.SUPER_ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }
  // Các role khác chỉ có thể quản lý role thấp hơn
  return targetIndex > currentIndex;
}
/**
 * LẤY DANH SÁCH PERMISSIONS THEO NHÓM
 */
function getPermissionsByGroup() {
  const groups = {};
  
  Object.values(PERMISSIONS).forEach(permission => {
    const [group] = permission.split('.');
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
  });
  
  return groups;
}

/**
 * KIỂM TRA QUYỀN XEM THÔNG TIN NHẠY CẢM
 */
function canViewSensitiveInfo(role) {
  return hasPermission(role, PERMISSIONS.VIEW_USER_SENSITIVE);
}
/**
 *  KIỂM TRA QUYỀN HỆ THỐNG
 */
function hasSystemAccess(role) {
  const systemPermissions = [
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.AUDIT_LOG_VIEW,
    PERMISSIONS.BACKUP_DATA,
    PERMISSIONS.RESTORE_DATA
  ];
  return systemPermissions.some(permission => hasPermission(role, permission));
}
>>>>>>> Stashed changes
module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  canCreateRole,
  canAccessPatientData,
  getCreatableRoles,
  hasModuleAccess,
<<<<<<< Updated upstream
};
=======
  getRolePermissions,
  canManageUser,
  getPermissionsByGroup,
  canViewSensitiveInfo,
  hasSystemAccess,
};  
>>>>>>> Stashed changes
