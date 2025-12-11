// healthcare-backend/src/constants/roles.js
/**
 * 🏥 HỆ THỐNG PHÂN QUYỀN RBAC CHUẨN HEALTHCARE ENTERPRISE
 * Author: Healthcare Development Team
 * Description: Hệ thống phân quyền theo vai trò cho hệ thống y tế
 * - Tuân thủ HIPAA và tiêu chuẩn bảo mật y tế
 * - Hỗ trợ đa dạng vai trò trong bệnh viện
 * - Bảo vệ dữ liệu bệnh nhân theo nguyên tắc "least privilege"
 */

// ===== ĐỊNH NGHĨA ROLES =====
const ROLES = Object.freeze({
  // ===== HỆ THỐNG & QUẢN TRỊ =====
  SUPER_ADMIN: 'SUPER_ADMIN',           // Quản trị hệ thống cao nhất
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',     // Quản trị bệnh viện
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',   // Trưởng khoa/phòng
  
  // ===== NHÂN VIÊN Y TẾ =====
  DOCTOR: 'DOCTOR',                     // Bác sĩ điều trị
  NURSE: 'NURSE',                       // Y tá/Điều dưỡng
  PHARMACIST: 'PHARMACIST',             // Dược sĩ
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',     // Kỹ thuật viên xét nghiệm
  
  // ===== NHÂN VIÊN HÀNH CHÍNH =====
  RECEPTIONIST: 'RECEPTIONIST',         // Lễ tân
  BILLING_STAFF: 'BILLING_STAFF',       // Nhân viên kế toán
  
  // ===== NGƯỜI DÙNG =====
  PATIENT: 'PATIENT',                   // Bệnh nhân
  GUEST: 'GUEST',                       // Khách (chưa đăng nhập)
});

// ===== ĐỊNH NGHĨA PERMISSIONS =====
const PERMISSIONS = Object.freeze({
  // ===== AUTHENTICATION =====
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
  'USER.CREATE': 'USER.CREATE',
  'USER.UPDATE': 'USER.UPDATE',
  'USER.DELETE': 'USER.DELETE',
  'USER.DISABLE': 'USER.DISABLE',
  'USER.ENABLE': 'USER.ENABLE',
  'USER.RESTORE': 'USER.RESTORE',
  'USER.VIEW_SENSITIVE': 'USER.VIEW_SENSITIVE',

  // ===== QUẢN LÝ BỆNH NHÂN =====
  'PATIENT.VIEW': 'PATIENT.VIEW',
  'PATIENT.CREATE': 'PATIENT.CREATE',
  'PATIENT.UPDATE': 'PATIENT.UPDATE',
  'PATIENT.DELETE': 'PATIENT.DELETE',
  'PATIENT.ADMIT': 'PATIENT.ADMIT',
  'PATIENT.DISCHARGE': 'PATIENT.DISCHARGE',
  'PATIENT.VIEW_SENSITIVE': 'PATIENT.VIEW_SENSITIVE',

  // ===== HỒ SƠ BỆNH ÁN =====
  'MEDICAL.VIEW_RECORDS': 'MEDICAL.VIEW_RECORDS',
  'MEDICAL.CREATE_RECORDS': 'MEDICAL.CREATE_RECORDS',
  'MEDICAL.UPDATE_RECORDS': 'MEDICAL.UPDATE_RECORDS',
  'MEDICAL.DELETE_RECORDS': 'MEDICAL.DELETE_RECORDS',
  'MEDICAL.EXPORT_RECORDS': 'MEDICAL.EXPORT_RECORDS',
  
  // ===== TƯ VẤN/KHÁM BỆNH =====
  'CONSULTATION.VIEW': 'CONSULTATION.VIEW',
  'CONSULTATION.CREATE': 'CONSULTATION.CREATE',
  'CONSULTATION.UPDATE': 'CONSULTATION.UPDATE',
  'CONSULTATION.DELETE': 'CONSULTATION.DELETE',
  
  // ===== CHẨN ĐOÁN =====
  'DIAGNOSIS.VIEW': 'DIAGNOSIS.VIEW',
  'DIAGNOSIS.CREATE': 'DIAGNOSIS.CREATE',
  'DIAGNOSIS.UPDATE': 'DIAGNOSIS.UPDATE',
  'DIAGNOSIS.DELETE': 'DIAGNOSIS.DELETE',
  
  // ===== ĐIỀU TRỊ =====
  'TREATMENT.VIEW_PLANS': 'TREATMENT.VIEW_PLANS',
  'TREATMENT.CREATE_PLANS': 'TREATMENT.CREATE_PLANS',
  'TREATMENT.UPDATE_PLANS': 'TREATMENT.UPDATE_PLANS',

  // ===== ĐƠN THUỐC =====
  'PRESCRIPTION.VIEW': 'PRESCRIPTION.VIEW',
  'PRESCRIPTION.CREATE': 'PRESCRIPTION.CREATE',
  'PRESCRIPTION.UPDATE': 'PRESCRIPTION.UPDATE',
  'PRESCRIPTION.DELETE': 'PRESCRIPTION.DELETE',
  'PRESCRIPTION.DISPENSE': 'PRESCRIPTION.DISPENSE',

  // ===== LỊCH HẸN =====
  'APPOINTMENT.VIEW': 'APPOINTMENT.VIEW',
  'APPOINTMENT.CREATE': 'APPOINTMENT.CREATE',
  'APPOINTMENT.UPDATE': 'APPOINTMENT.UPDATE',
  'APPOINTMENT.CANCEL': 'APPOINTMENT.CANCEL',
  'APPOINTMENT.VIEW_SCHEDULE': 'APPOINTMENT.VIEW_SCHEDULE',

  // ===== XÉT NGHIỆM =====
  'LAB.VIEW_ORDERS': 'LAB.VIEW_ORDERS',
  'LAB.CREATE_ORDERS': 'LAB.CREATE_ORDERS',
  'LAB.UPDATE_ORDERS': 'LAB.UPDATE_ORDERS',
  'LAB.VIEW_RESULTS': 'LAB.VIEW_RESULTS',
  'LAB.CREATE_RESULTS': 'LAB.CREATE_RESULTS',
  'LAB.UPDATE_RESULTS': 'LAB.UPDATE_RESULTS',
  'LAB.APPROVE_RESULTS': 'LAB.APPROVE_RESULTS',

  // ===== TÀI CHÍNH =====
  'BILL.VIEW': 'BILL.VIEW',
  'BILL.CREATE': 'BILL.CREATE',
  'BILL.UPDATE': 'BILL.UPDATE',
  'BILL.DELETE': 'BILL.DELETE',
  'BILL.PROCESS_PAYMENTS': 'BILL.PROCESS_PAYMENTS',
  'BILL.VIEW_REPORTS': 'BILL.VIEW_REPORTS',

  // ===== QUẢN LÝ KHO =====
  'INVENTORY.VIEW': 'INVENTORY.VIEW',
  'INVENTORY.UPDATE': 'INVENTORY.UPDATE',
  'INVENTORY.MANAGE_MEDICATION': 'INVENTORY.MANAGE_MEDICATION',

  // ===== BÁO CÁO =====
  'REPORT.VIEW': 'REPORT.VIEW',
  'REPORT.GENERATE': 'REPORT.GENERATE',
  'REPORT.EXPORT': 'REPORT.EXPORT',

  // ===== KHẨN CẤP =====
  'EMERGENCY.ACCESS': 'EMERGENCY.ACCESS',
  'EMERGENCY.BYPASS_APPROVAL': 'EMERGENCY.BYPASS_APPROVAL',

  // ===== HỆ THỐNG =====
  'SYSTEM.CONFIG': 'SYSTEM.CONFIG',
  'SYSTEM.VIEW_AUDIT_LOG': 'SYSTEM.VIEW_AUDIT_LOG',
  'SYSTEM.BACKUP_DATA': 'SYSTEM.BACKUP_DATA',
  'SYSTEM.RESTORE_DATA': 'SYSTEM.RESTORE_DATA',
});

// ===== PHÂN QUYỀN THEO ROLE =====
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: [
    // Toàn quyền hệ thống
    ...Object.values(PERMISSIONS)
  ],

  [ROLES.HOSPITAL_ADMIN]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'], PERMISSIONS['USER.CREATE'], 
    PERMISSIONS['USER.UPDATE'], PERMISSIONS['USER.DISABLE'],
    PERMISSIONS['USER.DELETE'], PERMISSIONS['USER.ENABLE'],
    PERMISSIONS['USER.RESTORE'], PERMISSIONS['USER.VIEW_SENSITIVE'],
    
    // Patient Management
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'],
    PERMISSIONS['PATIENT.UPDATE'], PERMISSIONS['PATIENT.DELETE'],
    PERMISSIONS['PATIENT.ADMIT'], PERMISSIONS['PATIENT.DISCHARGE'],
    PERMISSIONS['PATIENT.VIEW_SENSITIVE'],
    
    // Medical Records
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.EXPORT_RECORDS'],
    
    // Registration Permissions
    PERMISSIONS['AUTH.REGISTER_PATIENT'], PERMISSIONS['AUTH.REGISTER_RECEPTIONIST'],
    PERMISSIONS['AUTH.REGISTER_BILLING_STAFF'], PERMISSIONS['AUTH.REGISTER_LAB_TECHNICIAN'],
    PERMISSIONS['AUTH.REGISTER_PHARMACIST'], PERMISSIONS['AUTH.REGISTER_NURSE'],
    PERMISSIONS['AUTH.REGISTER_DOCTOR'], PERMISSIONS['AUTH.REGISTER_DEPARTMENT_HEAD'],
    
    // Other modules
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_ORDERS'], PERMISSIONS['LAB.VIEW_RESULTS'],
    PERMISSIONS['BILL.VIEW'], PERMISSIONS['BILL.CREATE'], PERMISSIONS['BILL.UPDATE'],
    PERMISSIONS['BILL.VIEW_REPORTS'], PERMISSIONS['REPORT.VIEW'],
    PERMISSIONS['REPORT.GENERATE'], PERMISSIONS['REPORT.EXPORT'],
    PERMISSIONS['INVENTORY.VIEW'], PERMISSIONS['INVENTORY.UPDATE'],
    PERMISSIONS['EMERGENCY.ACCESS'], PERMISSIONS['SYSTEM.VIEW_AUDIT_LOG'],
    PERMISSIONS['SYSTEM.CONFIG'], PERMISSIONS['SYSTEM.BACKUP_DATA'],
  ],

  [ROLES.DEPARTMENT_HEAD]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'], PERMISSIONS['USER.UPDATE'], PERMISSIONS['USER.ENABLE'],
    
    // Patient Management
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'],
    PERMISSIONS['PATIENT.UPDATE'], PERMISSIONS['PATIENT.ADMIT'],
    PERMISSIONS['PATIENT.DISCHARGE'],
    
    // Medical Records
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.CREATE_RECORDS'],
    PERMISSIONS['MEDICAL.UPDATE_RECORDS'], PERMISSIONS['MEDICAL.EXPORT_RECORDS'],
    
    // Registration Permissions
    PERMISSIONS['AUTH.REGISTER_DOCTOR'], PERMISSIONS['AUTH.REGISTER_NURSE'],
    PERMISSIONS['AUTH.REGISTER_LAB_TECHNICIAN'],
    
    // Medical modules
    PERMISSIONS['CONSULTATION.VIEW'], PERMISSIONS['CONSULTATION.CREATE'],
    PERMISSIONS['CONSULTATION.UPDATE'], PERMISSIONS['DIAGNOSIS.VIEW'],
    PERMISSIONS['DIAGNOSIS.CREATE'], PERMISSIONS['DIAGNOSIS.UPDATE'],
    PERMISSIONS['TREATMENT.VIEW_PLANS'], PERMISSIONS['TREATMENT.CREATE_PLANS'],
    PERMISSIONS['TREATMENT.UPDATE_PLANS'], PERMISSIONS['PRESCRIPTION.VIEW'],
    PERMISSIONS['PRESCRIPTION.CREATE'], PERMISSIONS['APPOINTMENT.VIEW'],
    PERMISSIONS['APPOINTMENT.CREATE'], PERMISSIONS['APPOINTMENT.UPDATE'],
    PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'], PERMISSIONS['LAB.VIEW_ORDERS'],
    PERMISSIONS['LAB.CREATE_ORDERS'], PERMISSIONS['LAB.VIEW_RESULTS'],
    PERMISSIONS['LAB.APPROVE_RESULTS'], PERMISSIONS['REPORT.VIEW'],
    PERMISSIONS['REPORT.GENERATE'], PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.DOCTOR]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Patient Management
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.UPDATE'],
    PERMISSIONS['PATIENT.ADMIT'], PERMISSIONS['PATIENT.DISCHARGE'],
    
    // Medical Records
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.CREATE_RECORDS'],
    PERMISSIONS['MEDICAL.UPDATE_RECORDS'],
    
    // Medical modules
    PERMISSIONS['CONSULTATION.VIEW'], PERMISSIONS['CONSULTATION.CREATE'],
    PERMISSIONS['CONSULTATION.UPDATE'], PERMISSIONS['DIAGNOSIS.VIEW'],
    PERMISSIONS['DIAGNOSIS.CREATE'], PERMISSIONS['DIAGNOSIS.UPDATE'],
    PERMISSIONS['TREATMENT.VIEW_PLANS'], PERMISSIONS['TREATMENT.CREATE_PLANS'],
    PERMISSIONS['TREATMENT.UPDATE_PLANS'], PERMISSIONS['PRESCRIPTION.VIEW'],
    PERMISSIONS['PRESCRIPTION.CREATE'], PERMISSIONS['PRESCRIPTION.UPDATE'],
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.CREATE'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_ORDERS'], PERMISSIONS['LAB.CREATE_ORDERS'],
    PERMISSIONS['LAB.VIEW_RESULTS'], PERMISSIONS['LAB.CREATE_RESULTS'],
    PERMISSIONS['LAB.APPROVE_RESULTS'], PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.NURSE]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Patient Management
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.UPDATE'],
    
    // Medical Records
    PERMISSIONS['MEDICAL.VIEW_RECORDS'], PERMISSIONS['MEDICAL.UPDATE_RECORDS'],
    
    // Medical modules
    PERMISSIONS['CONSULTATION.VIEW'], PERMISSIONS['CONSULTATION.UPDATE'],
    PERMISSIONS['DIAGNOSIS.VIEW'], PERMISSIONS['TREATMENT.VIEW_PLANS'],
    PERMISSIONS['TREATMENT.UPDATE_PLANS'], PERMISSIONS['PRESCRIPTION.VIEW'],
    PERMISSIONS['PRESCRIPTION.DISPENSE'], PERMISSIONS['APPOINTMENT.VIEW'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    PERMISSIONS['LAB.VIEW_ORDERS'], PERMISSIONS['LAB.VIEW_RESULTS'],
    PERMISSIONS['LAB.CREATE_RESULTS'], PERMISSIONS['EMERGENCY.ACCESS'],
  ],

  [ROLES.PHARMACIST]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Pharmacy specific
    PERMISSIONS['PRESCRIPTION.VIEW'], PERMISSIONS['PRESCRIPTION.DISPENSE'],
    PERMISSIONS['INVENTORY.VIEW'], PERMISSIONS['INVENTORY.UPDATE'],
    PERMISSIONS['INVENTORY.MANAGE_MEDICATION'],
  ],

  [ROLES.LAB_TECHNICIAN]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Lab specific
    PERMISSIONS['LAB.VIEW_ORDERS'], PERMISSIONS['LAB.VIEW_RESULTS'],
    PERMISSIONS['LAB.UPDATE_ORDERS'], PERMISSIONS['LAB.CREATE_RESULTS'], PERMISSIONS['LAB.UPDATE_RESULTS'],
  ],

  [ROLES.RECEPTIONIST]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // Patient Registration
    PERMISSIONS['AUTH.REGISTER_PATIENT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Patient Management
    PERMISSIONS['PATIENT.VIEW'], PERMISSIONS['PATIENT.CREATE'],
    
    // Appointments
    PERMISSIONS['APPOINTMENT.VIEW'], PERMISSIONS['APPOINTMENT.CREATE'],
    PERMISSIONS['APPOINTMENT.UPDATE'], PERMISSIONS['APPOINTMENT.CANCEL'],
    PERMISSIONS['APPOINTMENT.VIEW_SCHEDULE'],
    
    // Billing
    PERMISSIONS['BILL.VIEW'], PERMISSIONS['BILL.CREATE'],
  ],

  [ROLES.BILLING_STAFF]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // User Management
    PERMISSIONS['USER.VIEW'],
    
    // Billing
    PERMISSIONS['BILL.VIEW'], PERMISSIONS['BILL.CREATE'],
    PERMISSIONS['BILL.UPDATE'], PERMISSIONS['BILL.DELETE'],
    PERMISSIONS['BILL.PROCESS_PAYMENTS'], PERMISSIONS['BILL.VIEW_REPORTS'],
  ],

  [ROLES.PATIENT]: [
    // Authentication
    PERMISSIONS['AUTH.LOGIN'], PERMISSIONS['AUTH.LOGOUT'],
    
    // Self data access only
    PERMISSIONS['MEDICAL.VIEW_RECORDS'],   // Only own records
    PERMISSIONS['CONSULTATION.VIEW'],      // Only own consultations
    PERMISSIONS['DIAGNOSIS.VIEW'],         // Only own diagnosis
    PERMISSIONS['PRESCRIPTION.VIEW'],      // Only own prescriptions
    PERMISSIONS['APPOINTMENT.VIEW'],       // Only own appointments
    PERMISSIONS['APPOINTMENT.CREATE'],     // Create own appointments
    PERMISSIONS['APPOINTMENT.CANCEL'],     // Cancel own appointments
    PERMISSIONS['BILL.VIEW'],              // Only own bills
    PERMISSIONS['LAB.VIEW_RESULTS'],       // Only own lab results
  ],

  [ROLES.GUEST]: [
    // Limited access
    PERMISSIONS['AUTH.LOGIN'],
    PERMISSIONS['AUTH.SELF_REGISTER'],     // Self-register as patient
  ],
});

// ===== HIERARCHY & WEIGHTS =====
const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,          // 0 - Highest
  ROLES.HOSPITAL_ADMIN,       // 1
  ROLES.DEPARTMENT_HEAD,      // 2
  ROLES.DOCTOR,               // 3
  ROLES.PHARMACIST,           // 4
  ROLES.NURSE,                // 5
  ROLES.LAB_TECHNICIAN,       // 6
  ROLES.BILLING_STAFF,        // 7
  ROLES.RECEPTIONIST,         // 8
  ROLES.PATIENT,              // 9
  ROLES.GUEST,                // 10 - Lowest
];

const ROLE_WEIGHTS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 0,
  [ROLES.HOSPITAL_ADMIN]: 1,
  [ROLES.DEPARTMENT_HEAD]: 2,
  [ROLES.DOCTOR]: 3,
  [ROLES.PHARMACIST]: 4,
  [ROLES.NURSE]: 5,
  [ROLES.LAB_TECHNICIAN]: 6,
  [ROLES.BILLING_STAFF]: 7,
  [ROLES.RECEPTIONIST]: 8,
  [ROLES.PATIENT]: 9,
  [ROLES.GUEST]: 10,
});

// ===== HELPER FUNCTIONS =====

/**
 * Kiểm tra quyền của role
 * @param {string} role - Vai trò cần kiểm tra
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  if (!role || !permission) {
    console.warn('❌ [RBAC] Missing role or permission:', { role, permission });
    return false;
  }
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) {
    console.warn('❌ [RBAC] Role not found:', role);
    return false;
  }
  
  return permissions.includes(permission);
}

/**
 * Kiểm tra quyền tạo role
 * @param {string} currentRole - Vai trò hiện tại
 * @param {string} targetRole - Vai trò muốn tạo
 * @returns {boolean}
 */
function canCreateRole(currentRole, targetRole) {
  // Validate input
  if (!currentRole || !targetRole) {
    console.error('❌ [RBAC] Invalid input for canCreateRole:', { currentRole, targetRole });
    return false;
  }

  // SUPER_ADMIN can create any role except itself
  if (currentRole === ROLES.SUPER_ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }

  // Get weights
  const currentWeight = ROLE_WEIGHTS[currentRole];
  const targetWeight = ROLE_WEIGHTS[targetRole];

  // Validate weights exist
  if (currentWeight === undefined || targetWeight === undefined) {
    console.error('❌ [RBAC] Invalid role weights:', { currentRole, targetRole, currentWeight, targetWeight });
    return false;
  }

  // Higher role can create lower roles (higher weight number = lower role)
  return targetWeight > currentWeight;
}

/**
 * Kiểm tra quyền truy cập dữ liệu bệnh nhân
 * @param {string} userRole - Vai trò người truy cập
 * @param {string} patientId - ID bệnh nhân
 * @param {string} accessorId - ID người truy cập
 * @param {boolean} isEmergency - Có phải tình huống khẩn cấp
 * @returns {boolean}
 */
function canAccessPatientData(userRole, patientId, accessorId, isEmergency = false) {
  // Emergency access override
  if (isEmergency && hasPermission(userRole, PERMISSIONS['EMERGENCY.ACCESS'])) {
    return true;
  }

  // Patients can only access their own data
  if (userRole === ROLES.PATIENT) {
    return patientId === accessorId;
  }

  // Medical staff can access based on permissions
  const medicalStaff = [
    ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, 
    ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN
  ];
  
  if (medicalStaff.includes(userRole)) {
    return hasPermission(userRole, PERMISSIONS['MEDICAL.VIEW_RECORDS']);
  }

  // Administrative staff with patient view permission
  if ([ROLES.RECEPTIONIST, ROLES.BILLING_STAFF].includes(userRole)) {
    return hasPermission(userRole, PERMISSIONS['PATIENT.VIEW']);
  }

  return false;
}

/**
 * Lấy danh sách role có thể tạo
 * @param {string} currentRole - Vai trò hiện tại
 * @returns {string[]}
 */
function getCreatableRoles(currentRole) {
  return ROLE_HIERARCHY.filter(targetRole => canCreateRole(currentRole, targetRole));
}

/**
 * Kiểm tra quyền theo module
 * @param {string} role - Vai trò
 * @param {string} module - Module cần kiểm tra
 * @returns {boolean}
 */
function hasModuleAccess(role, module) {
  const modulePermissions = Object.values(PERMISSIONS).filter(p => 
    p.startsWith(`${module}.`)
  );
  
  return modulePermissions.some(permission => hasPermission(role, permission));
}

/**
 * Lấy danh sách permissions theo role
 * @param {string} role - Vai trò
 * @returns {string[]}
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Kiểm tra quyền quản lý user
 * @param {string} currentRole - Vai trò hiện tại
 * @param {string} targetRole - Vai trò mục tiêu
 * @returns {boolean}
 */
function canManageUser(currentRole, targetRole) {
  if (!currentRole || !targetRole) return false;

  // SUPER_ADMIN can manage all roles except itself
  if (currentRole === ROLES.SUPER_ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }

  const currentWeight = ROLE_WEIGHTS[currentRole];
  const targetWeight = ROLE_WEIGHTS[targetRole];

  if (currentWeight === undefined || targetWeight === undefined) return false;

  // Higher roles can manage lower roles
  return targetWeight > currentWeight;
}

/**
 * Lấy permissions theo nhóm
 * @returns {Object}
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

// ===== EXPORT =====
module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_WEIGHTS,
  hasPermission,
  canCreateRole,
  canAccessPatientData,
  getCreatableRoles,
  hasModuleAccess,
  getRolePermissions,
  canManageUser,
  getPermissionsByGroup,
};

// ===== DEBUG UTILITY =====
if (require.main === module) {
  console.log('=== RBAC SYSTEM DEBUG ===');
  
  // Test role creation permissions
  const testCases = [
    { current: ROLES.SUPER_ADMIN, target: ROLES.DOCTOR, expected: true },
    { current: ROLES.SUPER_ADMIN, target: ROLES.HOSPITAL_ADMIN, expected: true },
    { current: ROLES.SUPER_ADMIN, target: ROLES.SUPER_ADMIN, expected: false },
    { current: ROLES.HOSPITAL_ADMIN, target: ROLES.DOCTOR, expected: true },
    { current: ROLES.HOSPITAL_ADMIN, target: ROLES.DEPARTMENT_HEAD, expected: true },
    { current: ROLES.DEPARTMENT_HEAD, target: ROLES.DOCTOR, expected: true },
    { current: ROLES.DOCTOR, target: ROLES.NURSE, expected: false }
  ];

  testCases.forEach((test, index) => {
    const result = canCreateRole(test.current, test.target);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${test.current} -> ${test.target} = ${result}`);
  });
}