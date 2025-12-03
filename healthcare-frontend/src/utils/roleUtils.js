// Phân nhóm role theo tính chất công việc
export const ROLE_GROUPS = {
  PATIENT_GROUP: ['PATIENT', 'GUEST'],
  MEDICAL_STAFF_GROUP: ['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN'],
  ADMIN_GROUP: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DEPARTMENT_HEAD', 'RECEPTIONIST', 'BILLING_STAFF']
};

// Xác định nhóm của role
export const getRoleGroup = (role) => {
  if (ROLE_GROUPS.PATIENT_GROUP.includes(role)) return 'PATIENT_GROUP';
  if (ROLE_GROUPS.MEDICAL_STAFF_GROUP.includes(role)) return 'MEDICAL_STAFF_GROUP';
  if (ROLE_GROUPS.ADMIN_GROUP.includes(role)) return 'ADMIN_GROUP';
  return 'PATIENT_GROUP';
};

// Lấy route dashboard tương ứng
export const getDashboardRoute = (role) => {
  const group = getRoleGroup(role);
  
  switch (group) {
    case 'PATIENT_GROUP':
      return '/patient/dashboard';
    case 'MEDICAL_STAFF_GROUP':
      return '/medical/dashboard';
    case 'ADMIN_GROUP':
      return '/admin/dashboard';
    default:
      return '/patient/dashboard';
  }
};

// Kiểm tra permission theo nhóm
export const hasGroupAccess = (userRole, requiredGroup) => {
  return ROLE_GROUPS[requiredGroup]?.includes(userRole) || false;
};

// Lấy tên hiển thị của role
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'PATIENT': 'Bệnh nhân',
    'GUEST': 'Khách',
    'DOCTOR': 'Bác sĩ',
    'NURSE': 'Y tá/Điều dưỡng',
    'PHARMACIST': 'Dược sĩ',
    'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
    'SUPER_ADMIN': 'Quản trị viên cao cấp',
    'HOSPITAL_ADMIN': 'Quản lý bệnh viện',
    'DEPARTMENT_HEAD': 'Trưởng khoa',
    'RECEPTIONIST': 'Lễ tân',
    'BILLING_STAFF': 'Nhân viên kế toán'
  };
  return roleNames[role] || 'Người dùng';
};

// Lấy tên hiển thị của nhóm
export const getGroupDisplayName = (group) => {
  const groupNames = {
    'PATIENT_GROUP': 'Bệnh Nhân & Người Dùng',
    'MEDICAL_STAFF_GROUP': 'Nhân Viên Y Tế',
    'ADMIN_GROUP': 'Quản Trị & Hành Chính'
  };
  return groupNames[group] || 'Người dùng';
};