// src/constants/roles.js
/**
 * 🌐 HỆ THỐNG PHÂN QUYỀN RBAC CHUẨN HEALTHCARE ENTERPRISE
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
  BILLING_STAFF: 'BILLING_STAFF',  // Nhân viên kế toán
  
  // ===== NGƯỜI DÙNG =====
  PATIENT: 'PATIENT',                // Bệnh nhân
  GUEST: 'GUEST',                    // Khách (chưa đăng nhập)
});

const PERMISSIONS = Object.freeze({
  // ===== AUTHENTICATION & CƠ BẢN =====
  'AUTH.LOGIN': 'AUTH.LOGIN',
  'AUTH.LOGOUT': 'AUTH.LOGOUT', 
  'AUTH.SELF_REGISTER': 'AUTH.SELF_REGISTER',
  
  // ===== ĐĂNG KÝ TÀI KHOẢN =====
  'AUTH.REGISTER_PATIENT': 'AUTH.REGISTER_PATIENT',
  'AUTH.REGISTER_RECEPTIONIST': 'AUTH.REGISTER_RECEPTIONIST',
  'AUTH.REGISTER_BILLING_STAFF': 'AUTH.REGISTER_BILLING_STAFF',
  'AUTH.REGISTER_LAB_TECHNICIAN': 'AUTH.REGISTER_LAB_TECHNICIAN',
  'AUTH.REGISTER_PHARMACIST': 'AUTH.REGISTER_PHARMACIST',
  'AUTH.REGISTER_NURSE': 'AUTH.REGISTER_NURSE',
  'AUTH.REGISTER_DOCTOR': 'AUTH.REGISTER_DOCTOR',
  'AUTH.REGISTER_DEPARTMENT_HEAD': 'AUTH.REGISTER_DEPARTMENT_HEAD',
  'AUTH.REGISTER_HOSPITAL_ADMIN': 'AUTH.REGISTER_HOSPITAL_ADMIN',

  // ===== QUẢN LÝ NGƯỜI DÙNG =====
  'USER.VIEW': 'USER.VIEW',
  'USER.CREATE': 'USER.CREATE', // 🆕 THIẾU
  'USER.UPDATE': 'USER.UPDATE',
  'USER.DISABLE': 'USER.DISABLE',
  'USER.VIEW_SENSITIVE': 'USER.VIEW_SENSITIVE', // Xem thông tin nhạy cảm
  'USER.MANAGE': 'USER.MANAGE', // 🆕 THIẾU

  // ===== QUẢN LÝ BỆNH NHÂN ===== 🆕 THIẾU MODULE QUAN TRỌNG
  'PATIENT.VIEW': 'PATIENT.VIEW',
  'PATIENT.CREATE': 'PATIENT.CREATE', 
  'PATIENT.UPDATE': 'PATIENT.UPDATE',
  'PATIENT.DELETE': 'PATIENT.DELETE',
  'PATIENT.ADMIT': 'PATIENT.ADMIT',
  'PATIENT.DISCHARGE': 'PATIENT.DISCHARGE',

  // ===== HỒ SƠ BỆNH ÁN ===== (Quan trọng nhất)
  'MEDICAL.VIEW_RECORDS': 'MEDICAL.VIEW_RECORDS',
  'MEDICAL.CREATE_RECORDS': 'MEDICAL.CREATE_RECORDS',
  'MEDICAL.UPDATE_RECORDS': 'MEDICAL.UPDATE_RECORDS',
  'MEDICAL.DELETE_RECORDS': 'MEDICAL.DELETE_RECORDS',
  'MEDICAL.EXPORT_RECORDS': 'MEDICAL.EXPORT_RECORDS',
  
  // ===== CHẨN ĐOÁN & ĐIỀU TRỊ =====
  'MEDICAL.CREATE_DIAGNOSIS': 'MEDICAL.CREATE_DIAGNOSIS',
  'MEDICAL.UPDATE_DIAGNOSIS': 'MEDICAL.UPDATE_DIAGNOSIS',
  'MEDICAL.VIEW_TREATMENT_PLANS': 'MEDICAL.VIEW_TREATMENT_PLANS',
  'MEDICAL.CREATE_TREATMENT_PLANS': 'MEDICAL.CREATE_TREATMENT_PLANS',
  'MEDICAL.UPDATE_TREATMENT_PLANS': 'MEDICAL.UPDATE_TREATMENT_PLANS',

  // ===== ĐƠN THUỐC =====
  'PRESCRIPTION.VIEW': 'PRESCRIPTION.VIEW',
  'PRESCRIPTION.CREATE': 'PRESCRIPTION.CREATE',
  'PRESCRIPTION.UPDATE': 'PRESCRIPTION.UPDATE',
  'PRESCRIPTION.DISPENSE': 'PRESCRIPTION.DISPENSE', // Phát thuốc

  // ===== LỊCH HẸN =====
  'APPOINTMENT.VIEW': 'APPOINTMENT.VIEW',
  'APPOINTMENT.CREATE': 'APPOINTMENT.CREATE',
  'APPOINTMENT.UPDATE': 'APPOINTMENT.UPDATE',
  'APPOINTMENT.CANCEL': 'APPOINTMENT.CANCEL',
  'APPOINTMENT.VIEW_SCHEDULE': 'APPOINTMENT.VIEW_SCHEDULE', // Lịch làm việc

  // ===== XÉT NGHIỆM & CẬN LÂM SÀNG =====
  'LAB.VIEW_RESULTS': 'LAB.VIEW_RESULTS',
  'LAB.CREATE_RESULTS': 'LAB.CREATE_RESULTS',
  'LAB.UPDATE_RESULTS': 'LAB.UPDATE_RESULTS',
  'LAB.APPROVE_RESULTS': 'LAB.APPROVE_RESULTS',

  // ===== THANH TOÁN & HÓA ĐƠN =====
  'BILL.VIEW': 'BILL.VIEW',
  'BILL.CREATE': 'BILL.CREATE',
  'BILL.UPDATE': 'BILL.UPDATE',
  'BILL.PROCESS_PAYMENTS': 'BILL.PROCESS_PAYMENTS',
  'BILL.VIEW_FINANCIAL_REPORTS': 'BILL.VIEW_FINANCIAL_REPORTS',

  // ===== QUẢN LÝ KHO =====
  'INVENTORY.VIEW': 'INVENTORY.VIEW',
  'INVENTORY.UPDATE': 'INVENTORY.UPDATE',
  'INVENTORY.MANAGE_MEDICATION': 'INVENTORY.MANAGE_MEDICATION',

  // ===== BÁO CÁO & THỐNG KÊ =====
  'REPORT.VIEW': 'REPORT.VIEW',
  'REPORT.GENERATE': 'REPORT.GENERATE',
  'REPORT.EXPORT': 'REPORT.EXPORT',

  // ===== QUYỀN KHẨN CẤP ===== (Y tế đặc thù)
  'EMERGENCY.ACCESS': 'EMERGENCY.ACCESS', // Truy cập khẩn trong tình huống cấp cứu
  'EMERGENCY.BYPASS_APPROVAL': 'EMERGENCY.BYPASS_APPROVAL',

  // ===== HỆ THỐNG =====
  'SYSTEM.CONFIG': 'SYSTEM.CONFIG',
  'SYSTEM.VIEW_AUDIT_LOG': 'SYSTEM.VIEW_AUDIT_LOG',
});

/**
 * 🎯 PHÂN QUYỀN CHI TIẾT THEO VAI TRÒ
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
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['AUTH.REGISTER_DEPARTMENT_HEAD'], PERMISSIONS['AUTH.REGISTER_DOCTOR'],
    PERMISSIONS['AUTH.REGISTER_NURSE'], PERMISSIONS['AUTH.REGISTER_PHARMACIST'],
    PERMISSIONS['AUTH.REGISTER_LAB_TECHNICIAN'], PERMISSIONS['AUTH.REGISTER_BILLING_STAFF'],
    PERMISSIONS['AUTH.REGISTER_RECEPTIONIST'],
    PERMISSIONS['USER.VIEW'], PERMISSIONS['USER.CREATE'], PERMISSIONS['USER.UPDATE'], 
    PERMISSIONS['USER.DISABLE'], PERMISSIONS['USER.MANAGE'], PERMISSIONS['USER.VIEW_SENSITIVE'],
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['PATIENT.ADMIT'], PERMISSIONS['PATIENT.DISCHARGE'],
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.EXPORT_RECORDS'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['BILL.VIEW'],
    PERMISSIONS['BILL.VIEW_FINANCIAL_REPORTS'], PERMISSIONS['REPORT.VIEW'],
    PERMISSIONS['REPORT.GENERATE'], PERMISSIONS['REPORT.EXPORT'],
    PERMISSIONS['EMERGENCY.ACCESS'], PERMISSIONS['SYSTEM.VIEW_AUDIT_LOG'],
  ],

  [ROLES.DEPARTMENT_HEAD]: [
    // Trưởng khoa
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['AUTH.REGISTER_DOCTOR'], PERMISSIONS['AUTH.REGISTER_NURSE'],
    PERMISSIONS['AUTH.REGISTER_LAB_TECHNICIAN'],
    PERMISSIONS['USER.VIEW'], PERMISSIONS['USER.UPDATE'],
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['PATIENT.ADMIT'], PERMISSIONS['PATIENT.DISCHARGE'],
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.CREATE_RECORDS'],
    PERMISSIONS['MEDICAL.UPDATE_RECORDS'], PERMISSIONS['MEDICAL.EXPORT_RECORDS'],
    PERMISSIONS['MEDICAL.CREATE_DIAGNOSIS'], PERMISSIONS['MEDICAL.UPDATE_DIAGNOSIS'],
    PERMISSIONS['MEDICAL.VIEW_TREATMENT_PLANS'], PERMISSIONS['MEDICAL.CREATE_TREATMENT_PLANS'],
    PERMISSIONS['MEDICAL.UPDATE_TREATMENT_PLANS'],
    PERMISSIONS['PRESCRIPTION.VIEW'], PERMISSIONS['PRESCRIPTION.CREATE'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.CREATE'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['LAB.APPROVE_RESULTS'],
    PERMISSIONS['REPORT.VIEW'], PERMISSIONS['REPORT.GENERATE'],
    PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.DOCTOR]: [
    // Bác sĩ điều trị
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.CREATE_RECORDS'],
    PERMISSIONS['MEDICAL.UPDATE_RECORDS'],
    PERMISSIONS['MEDICAL.CREATE_DIAGNOSIS'], PERMISSIONS['MEDICAL.UPDATE_DIAGNOSIS'],
    PERMISSIONS['MEDICAL.VIEW_TREATMENT_PLANS'], PERMISSIONS['MEDICAL.CREATE_TREATMENT_PLANS'],
    PERMISSIONS['MEDICAL.UPDATE_TREATMENT_PLANS'],
    PERMISSIONS['PRESCRIPTION.VIEW'], PERMISSIONS['PRESCRIPTION.CREATE'],
    PERMISSIONS['PRESCRIPTION.UPDATE'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.CREATE'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['LAB.CREATE_RESULTS'],
    PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.NURSE]: [
    // Y tá/Điều dưỡng
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.UPDATE_RECORDS'],
    PERMISSIONS['MEDICAL.VIEW_TREATMENT_PLANS'], PERMISSIONS['MEDICAL.UPDATE_TREATMENT_PLANS'],
    PERMISSIONS['PRESCRIPTION.VIEW'], PERMISSIONS['PRESCRIPTION.DISPENSE'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.UPDATE'],
    PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['LAB.CREATE_RESULTS'],
    PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.PHARMACIST]: [
    // Dược sĩ
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'],
    PERMISSIONS['PRESCRIPTION.VIEW'], PERMISSIONS['PRESCRIPTION.DISPENSE'],
    PERMISSIONS['INVENTORY.VIEW'], PERMISSIONS['INVENTORY.UPDATE'],
    PERMISSIONS['INVENTORY.MANAGE_MEDICATION'],
  ],

  [ROLES.LAB_TECHNICIAN]: [
    // Kỹ thuật viên xét nghiệm
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['LAB.CREATE_RESULTS'],
    PERMISSIONS['LAB.UPDATE_RESULTS'],
  ],

  [ROLES.RECEPTIONIST]: [
    // Lễ tân
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['AUTH.REGISTER_PATIENT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.CREATE'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.CANCEL'],
    PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
  ],

  [ROLES.BILLING_STAFF]: [
    // Nhân viên kế toán
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['USER.VIEW'],
    PERMISSIONS['PATIENT.VIEW'],
    PERMISSIONS['BILL.VIEW'], PERMISSIONS['BILL.CREATE'],
    PERMISSIONS['BILL.UPDATE'], PERMISSIONS['BILL.PROCESS_PAYMENTS'],
    PERMISSIONS['BILL.VIEW_FINANCIAL_REPORTS'],
  ],

  [ROLES.PATIENT]: [
    // Bệnh nhân
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], // Chỉ xem của bản thân
    PERMISSIONS['PRESCRIPTION.VIEW'],   // Chỉ xem của bản thân
    PERMISSIONS['APPOINTMENT.VIEW'],    // Chỉ xem của bản thân
    PERMISSIONS['APPOINTMENT.CREATE'],  // Đặt lịch hẹn
    PERMISSIONS['APPOINTMENT.CANCEL'],  // Hủy lịch của bản thân
    PERMISSIONS['BILL.VIEW'],           // Chỉ xem của bản thân
  ],

  [ROLES.GUEST]: [
    // Khách (chưa đăng nhập)
    PERMISSIONS['AUTH.LOGIN'],
    PERMISSIONS['AUTH.SELF_REGISTER'],        // Tự đăng ký tài khoản bệnh nhân
  ],
});

/**
 * 🏥 HIERARCHY CHUẨN Y TẾ - SỬA LẠI CHO ĐÚNG
 * - Thứ tự từ cao xuống thấp
 * - Phản ánh cơ cấu tổ chức bệnh viện thực tế
 */
const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.HOSPITAL_ADMIN]: 90,
  [ROLES.DEPARTMENT_HEAD]: 80,
  [ROLES.DOCTOR]: 70,
  [ROLES.PHARMACIST]: 65,
  [ROLES.NURSE]: 60,
  [ROLES.LAB_TECHNICIAN]: 55,
  [ROLES.BILLING_STAFF]: 50,
  [ROLES.RECEPTIONIST]: 45,
  [ROLES.PATIENT]: 10,
  [ROLES.GUEST]: 0,
});

/**
 * 🧩 HÀM HỖ TRỢ KIỂM TRA QUYỀN
 * Kiểm tra xem vai trò có quyền thực hiện hành động không
 * @param {string} role - Vai trò người dùng
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

/**
 * ⚡ KIỂM TRA QUYỀN TẠO ROLE - SỬA LẠI CHO ĐÚNG
 * Đảm bảo người dùng chỉ có thể tạo tài khoản cấp thấp hơn
 * @param {string} currentRole - Vai trò hiện tại
 * @param {string} targetRole - Vai trò muốn tạo
 * @returns {boolean}
 */
function canCreateRole(currentRole, targetRole) {
  const currentLevel = ROLE_HIERARCHY[currentRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  if (currentLevel === undefined || targetLevel === undefined) {
    return false;
  }
  
  // Chỉ được tạo role có level thấp hơn
  return currentLevel > targetLevel;
}

/**
 * 🚨 KIỂM TRA QUYỀN TRUY CẬP DỮ LIỆU BỆNH NHÂN
 * Quan trọng: Tuân thủ HIPAA và bảo vệ quyền riêng tư
 * @param {string} userRole - Vai trò người truy cập
 * @param {string} patientId - ID bệnh nhân
 * @param {string} accessorId - ID người truy cập
 * @param {boolean} isEmergency - Có phải tình huống khẩn cấp
 * @returns {boolean}
 */
function canAccessPatientData(userRole, patientId, accessorId, isEmergency = false) {
  // 🚑 TRƯỜNG HỢP KHẨN CẤP: Cho phép truy cập
  if (isEmergency && hasPermission(userRole, PERMISSIONS['EMERGENCY.ACCESS'])) {
    return true;
  }

  // 👤 BỆNH NHÂN: Chỉ xem dữ liệu của chính mình
  if (userRole === ROLES.PATIENT) {
    return patientId === accessorId;
  }

  // 🏥 NHÂN VIÊN Y TẾ: Được xem theo phân quyền
  const medicalStaff = [
    ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, 
    ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN
  ];
  
  if (medicalStaff.includes(userRole)) {
    return hasPermission(userRole, PERMISSIONS['MEDICAL.VIEW_RECORDS']);
  }

  // 🏢 NHÂN VIÊN HÀNH CHÍNH: Có quyền hạn chế
  const adminStaff = [ROLES.RECEPTIONIST, ROLES.BILLING_STAFF];
  if (adminStaff.includes(userRole)) {
    return hasPermission(userRole, PERMISSIONS['PATIENT.VIEW']);
  }

  return false;
}

/**
 * 📊 LẤY DANH SÁCH ROLE CÓ THỂ TẠO
 * @param {string} currentRole - Vai trò hiện tại
 * @returns {string[]}
 */
function getCreatableRoles(currentRole) {
  return Object.keys(ROLE_HIERARCHY).filter(targetRole => 
    canCreateRole(currentRole, targetRole)
  );
}

/**
 * 🔍 KIỂM TRA QUYỀN THEO MODULE
 * @param {string} role - Vai trò
 * @param {string} module - Module cần kiểm tra (USER, MEDICAL, etc.)
 * @returns {boolean}
 */
function hasModuleAccess(role, module) {
  const modulePermissions = Object.keys(PERMISSIONS).filter(p => 
    p.startsWith(`${module}.`)
  );
  
  return modulePermissions.some(permission => hasPermission(role, permission));
}

/**
 * 🆕 HÀM MỚI: KIỂM TRA EMERGENCY ACCESS
 * @param {string} role - Vai trò
 * @returns {boolean}
 */
function hasEmergencyAccess(role) {
  return hasPermission(role, PERMISSIONS['EMERGENCY.ACCESS']);
}

/**
 * 🆕 HÀM MỚI: LẤY TẤT CẢ PERMISSIONS CỦA ROLE
 * @param {string} role - Vai trò
 * @returns {string[]}
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

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
  hasEmergencyAccess, // 🆕 THÊM
  getRolePermissions, // 🆕 THÊM
};