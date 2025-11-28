export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  PHARMACIST: "PHARMACIST",
  LAB_TECHNICIAN: "LAB_TECHNICIAN",
  RECEPTIONIST: "RECEPTIONIST",
  BILLING_STAFF: "BILLING_STAFF",
  PATIENT: "PATIENT",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Quản trị viên",
  DOCTOR: "Bác sĩ",
  NURSE: "Y tá/Điều dưỡng",
  PHARMACIST: "Dược sĩ",
  LAB_TECHNICIAN: "Kỹ thuật viên xét nghiệm",
  RECEPTIONIST: "Tiếp tân",
  BILLING_STAFF: "Nhân viên tính tiền",
  PATIENT: "Bệnh nhân",
};

export const ROLE_COLORS = {
  SUPER_ADMIN: "red",
  ADMIN: "orange",
  DOCTOR: "blue",
  NURSE: "cyan",
  PHARMACIST: "purple",
  LAB_TECHNICIAN: "magenta",
  RECEPTIONIST: "geekblue",
  BILLING_STAFF: "gold",
  PATIENT: "green",
};

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  LOCKED: "LOCKED",
  SUSPENDED: "SUSPENDED",
};

export const USER_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  LOCKED: "Bị khóa",
  SUSPENDED: "Tạm dừng",
};

export const PERMISSIONS = {
  VIEW_USERS: "view_users",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  VIEW_SYSTEM: "view_system",
  MANAGE_SYSTEM: "manage_system",
};
