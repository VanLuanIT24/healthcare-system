// src/constants/roles.js
// File này dùng cho frontend - phải đồng bộ với backend (healthcare-backend/src/constants/roles.js)

export const ROLES = {
  // ===== QUẢN TRỊ HỆ THỐNG =====
  SUPER_ADMIN: 'SUPER_ADMIN',         // Quyền cao nhất
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',       // Quản trị hệ thống (IT/Ops)
  CLINICAL_ADMIN: 'CLINICAL_ADMIN',   // Bác sĩ trưởng cao cấp / Giám đốc chuyên môn

  // ===== QUẢN TRỊ BỆNH VIỆN & KHOA =====
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',   // Quản trị viên bệnh viện / Giám đốc bệnh viện
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD', // Trưởng khoa / Trưởng phòng

  // ===== NHÂN VIÊN Y TẾ =====
  DOCTOR: 'DOCTOR',                   // Bác sĩ
  NURSE: 'NURSE',                     // Y tá / Điều dưỡng
  PHARMACIST: 'PHARMACIST',           // Dược sĩ
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',   // Kỹ thuật viên xét nghiệm

  // ===== NHÂN VIÊN HÀNH CHÍNH =====
  RECEPTIONIST: 'RECEPTIONIST',       // Lễ tân
  BILLING_STAFF: 'BILLING_STAFF',     // Nhân viên thu ngân / Kế toán thanh toán

  // ===== NGƯỜI DÙNG BÊN NGOÀI =====
  PATIENT: 'PATIENT',                 // Bệnh nhân
  GUEST: 'GUEST',                     // Khách (chưa đăng ký)
};

// Nhãn hiển thị tiếng Việt (dùng cho UI: select, table, badge, v.v.)
export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SYSTEM_ADMIN: 'Quản trị Hệ thống',
  CLINICAL_ADMIN: 'Giám đốc Chuyên môn',
  HOSPITAL_ADMIN: 'Quản trị viên Bệnh viện',
  DEPARTMENT_HEAD: 'Trưởng khoa',
  DOCTOR: 'Bác sĩ',
  NURSE: 'Điều dưỡng',
  PHARMACIST: 'Dược sĩ',
  LAB_TECHNICIAN: 'Kỹ thuật viên XN',
  RECEPTIONIST: 'Lễ tân',
  BILLING_STAFF: 'Thu ngân',
  PATIENT: 'Bệnh nhân',
  GUEST: 'Khách',
};

// Optional: Mảng role để dùng trong dropdown (có thể lọc theo nhu cầu)
export const ROLE_OPTIONS = Object.keys(ROLES).map(key => ({
  value: ROLES[key],
  label: ROLE_LABELS[key],
}));

// Optional: Thứ tự hiển thị role (theo phân cấp - giống backend hierarchy)
export const ROLE_ORDER = [
  ROLES.SUPER_ADMIN,
  ROLES.SYSTEM_ADMIN,
  ROLES.CLINICAL_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.DEPARTMENT_HEAD,
  ROLES.DOCTOR,
  ROLES.PHARMACIST,
  ROLES.NURSE,
  ROLES.LAB_TECHNICIAN,
  ROLES.BILLING_STAFF,
  ROLES.RECEPTIONIST,
  ROLES.PATIENT,
  ROLES.GUEST,
];

// Hàm tiện ích: Lấy nhãn từ role
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role || 'Không xác định';
};

// Hàm kiểm tra role có phải nhân viên y tế không
export const isMedicalStaff = (role) => {
  return [
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.DEPARTMENT_HEAD,
    ROLES.CLINICAL_ADMIN,
    ROLES.HOSPITAL_ADMIN, // có quyền y tế cao
  ].includes(role);
};

// Hàm kiểm tra role có phải quản trị không
export const isAdminRole = (role) => {
  return [
    ROLES.SUPER_ADMIN,
    ROLES.SYSTEM_ADMIN,
    ROLES.CLINICAL_ADMIN,
    ROLES.HOSPITAL_ADMIN,
  ].includes(role);
};