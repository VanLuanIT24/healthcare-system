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

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin profile cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', authMiddleware, userController.getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật profile cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/profile',
  authMiddleware,
  validate(schemas.updateUserProfileBody, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.updateUserProfile
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Thay đổi mật khẩu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không đúng
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/change-password',
  authMiddleware,
  validate({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  }, 'body'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.changePassword
);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/avatar',
  authMiddleware,
  uploadMiddleware.single('avatar'),
  auditLog(AUDIT_ACTIONS.USER_UPDATE),
  userController.uploadProfilePicture
);

/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     summary: Xác thực email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email đã được xác thực
 *       400:
 *         description: Token không hợp lệ
 */
router.post('/verify-email',
  validate(schemas.verifyEmailBody, 'body'),
  userController.verifyEmail
);

/**
 * @swagger
 * /api/users/resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email xác thực đã được gửi lại
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/resend-verification',
  authMiddleware,
  userController.resendVerificationEmail
);

/**
 * @swagger
 * /api/users/register/patient:
 *   post:
 *     summary: Đăng ký bệnh nhân tự do
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register/patient',
  validate(schemas.createUserBody, 'body'),
  userController.registerPatient
);

// ==================================================================
// QUẢN LÝ NGƯỜI DÙNG (Dành cho admin) - Từ adminAPI.js
// ==================================================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Lọc theo role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, email
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN]),
  validate(schemas.listUsersQuery, 'query'),
  userController.listUsers
);

/**
 * @swagger
 * /api/users/deleted:
 *   get:
 *     summary: Lấy danh sách người dùng đã xóa
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng đã xóa
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
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