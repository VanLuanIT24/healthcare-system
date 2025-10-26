export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT'
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Quản trị viên',
  DOCTOR: 'Bác sĩ',
  PATIENT: 'Bệnh nhân'
};

export const ROLE_COLORS = {
  SUPER_ADMIN: 'red',
  ADMIN: 'orange',
  DOCTOR: 'blue',
  PATIENT: 'green'
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
  SUSPENDED: 'SUSPENDED'
};

export const USER_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  LOCKED: 'Bị khóa',
  SUSPENDED: 'Tạm dừng'
};

export const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_SYSTEM: 'view_system',
  MANAGE_SYSTEM: 'manage_system'
};
