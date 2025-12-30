// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const userController = require('../controllers/user.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/user.validation');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { uploadMiddleware } = require('../middlewares/upload.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const { ROLES } = require('../constants/roles');

// ==================================================================
// CÁ NHÂN (Dành cho mọi người dùng đã login) - Từ userAPI.js
// ==================================================================

// Lấy profile cá nhân
router.get('/profile', authMiddleware, userController.getUserProfile);

// Cập nhật profile cá nhân
router.put('/profile',
  authMiddleware,
  validate(schemas.updateUserProfileBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.updateUserProfile
);

// Thay đổi mật khẩu
router.post('/change-password',
  authMiddleware,
  validate({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  }, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.changePassword
);

// Upload avatar
router.post('/avatar',
  authMiddleware,
  uploadMiddleware.single('avatar'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.uploadProfilePicture
);

// Xác thực email
router.post('/verify-email',
  validate(schemas.verifyEmailBody, 'body'),
  userController.verifyEmail
);

// Gửi lại email xác thực
router.post('/resend-verification',
  authMiddleware,
  userController.resendVerificationEmail
);

// Đăng ký bệnh nhân tự do
router.post('/register/patient',
  validate(schemas.createUserBody, 'body'),
  userController.registerPatient
);

// ==================================================================
// QUẢN LÝ NGƯỜI DÙNG (Dành cho admin) - Từ adminAPI.js
// ==================================================================

// Danh sách users
router.get('/',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.listUsersQuery, 'query'),
  userController.listUsers
);

// Danh sách users đã xóa
router.get('/deleted',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.listUsersQuery, 'query'),
  userController.listDeletedUsers
);

// Lấy user theo ID
router.get('/:id',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.DOCTOR, ROLES.NURSE]),
  validate(schemas.userIdParams, 'params'),
  userController.getUserById
);

// Cập nhật user
router.put('/:id',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  validate(schemas.updateUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.updateUser
);

// Gán role
router.patch('/:id/role',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  validate(schemas.assignRoleBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.assignRole
);

// Vô hiệu hóa user
router.patch('/:id/disable',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  validate(schemas.disableUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_DISABLE),
  userController.disableUser
);

// Kích hoạt user
router.patch('/:id/enable',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.USER_ENABLE),
  userController.enableUser
);

// Khôi phục user
router.post('/:id/restore',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  auditLog(AUDIT_ACTIONS.USER_RESTORE),
  userController.restoreUser
);

// Xóa user
router.delete('/:id',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  validate(schemas.deleteUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_DELETE),
  userController.deleteUser
);

// Tìm kiếm users
router.get('/search',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.DEPARTMENT_HEAD]),
  validate(schemas.searchUsersQuery, 'query'),
  userController.searchUsers
);

// Users theo role
router.get('/by-role',
  authMiddleware,
  validate(schemas.getUsersByRole, 'query'),
  userController.getUsersByRole
);

// Users theo department (nếu có department module)
router.get('/by-department',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.DEPARTMENT_HEAD]),
  userController.getUsersByDepartment
);

// Thống kê users
router.get('/stats',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  userController.getUserStatistics
);

// Permissions của user
router.get('/:id/permissions',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.userIdParams, 'params'),
  userController.getUserPermissions
);

// Đăng ký theo role (cho admin)
router.post('/register/receptionist',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createReceptionist
);

router.post('/register/billing-staff',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createBillingStaff
);

router.post('/register/lab-technician',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createLabTechnician
);

router.post('/register/pharmacist',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createPharmacist
);

router.post('/register/nurse',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createNurse
);

router.post('/register/doctor',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createDoctor
);

router.post('/register/department-head',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createDepartmentHead
);

router.post('/register/hospital-admin',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN]),
  validate(schemas.createUserBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_CREATE),
  userController.createHospitalAdmin
);

// ==================================================================
// HỖ TRỢ UI (Roles & Permissions) - Không thay đổi dữ liệu
// ==================================================================
router.get('/roles', authMiddleware, userController.getRoles);
router.get('/roles/creatable', authMiddleware, userController.getCreatableRoles);
router.get('/roles/:role/permissions', authMiddleware, userController.getPermissionsByRole);
router.get('/permissions', authMiddleware, userController.getAllPermissions);

module.exports = router;