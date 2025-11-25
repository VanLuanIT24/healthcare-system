// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { 
  requirePermission: rbacRequirePermission
} = require('../middlewares/rbac.middleware');
const { 
  validateBody, 
  validateParams, 
  validateQuery,
  validateCombined 
} = require('../middlewares/validation.middleware');
const userValidation = require('../validations/user.validation');
const { 
  PERMISSIONS, 
  ROLES, 
  ROLE_HIERARCHY,  // 🎯 THÊM IMPORT NÀY
  canCreateRole    // 🎯 THÊM IMPORT NÀY
} = require('../constants/roles');  // 🎯 ĐẢM BẢO ĐÚNG PATH
const { upload } = require('../utils/fileUpload');

// 🔐 TẤT CẢ ROUTES ĐỀU YÊU CẦU XÁC THỰC
router.use(authenticate);

// 👥 USER MANAGEMENT ROUTES - ĐÃ TỐI ƯU PHÂN QUYỀN

// 🎯 TẠO USER MỚI - POST /api/users
router.post(
  '/',
  // Middleware dynamic để kiểm tra quyền tạo user theo role
  (req, res, next) => {
    const { role } = req.body;
    
    console.log('🎯 [ROUTE ROLE CHECK]', {
      currentUser: req.user?.email,
      currentRole: req.user?.role,
      targetRole: role,
      hierarchy: ROLE_HIERARCHY,
      canCreate: canCreateRole(req.user?.role, role)
    });

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role là bắt buộc'
      });
    }

    // SUPER_ADMIN có thể tạo mọi role (trừ chính nó)
    if (req.user?.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
      console.log('👑 [SUPER_ADMIN BYPASS] Super admin creating:', role);
      return next(); // Cho phép Super Admin tạo bất kỳ role nào
    }

    // Map role to corresponding permission
    const permissionMap = {
      [ROLES.PATIENT]: PERMISSIONS.REGISTER_PATIENT,
      [ROLES.DOCTOR]: PERMISSIONS.REGISTER_DOCTOR,
      [ROLES.NURSE]: PERMISSIONS.REGISTER_NURSE,
      [ROLES.PHARMACIST]: PERMISSIONS.REGISTER_PHARMACIST,
      [ROLES.LAB_TECHNICIAN]: PERMISSIONS.REGISTER_LAB_TECHNICIAN,
      [ROLES.RECEPTIONIST]: PERMISSIONS.REGISTER_RECEPTIONIST,
      [ROLES.BILLING_STAFF]: PERMISSIONS.REGISTER_BILLING_STAFF,
      [ROLES.DEPARTMENT_HEAD]: PERMISSIONS.REGISTER_DEPARTMENT_HEAD,
      [ROLES.HOSPITAL_ADMIN]: PERMISSIONS.REGISTER_HOSPITAL_ADMIN,
    };

    const requiredPermission = permissionMap[role];
    
    if (!requiredPermission) {
      return res.status(400).json({
        success: false,
        error: 'Role không hợp lệ'
      });
    }

    console.log(`🎯 [ROUTE] Checking permission for role ${role}: ${requiredPermission}`);
    
    // Gọi RBAC middleware với permission tương ứng
    rbacRequirePermission(requiredPermission)(req, res, next);
  },
  validateBody(userValidation.schemas.createUserBody),
  userController.createUser
);

// 🎯 DANH SÁCH USER - GET /api/users
router.get(
  '/',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateQuery(userValidation.schemas.listUsersQuery),
  userController.listUsers
);

// 🎯 LẤY THÔNG TIN PROFILE - GET /api/users/profile
router.get(
  '/profile',
  userController.getUserProfile
);

// 🎯 CẬP NHẬT PROFILE - PUT /api/users/profile
router.put(
  '/profile',
  validateBody(userValidation.schemas.updateUserProfileBody),
  userController.updateUserProfile
);

// 🎯 UPLOAD PROFILE PICTURE - POST /api/users/profile/picture
router.post(
  '/profile/picture',
  upload.single('profilePicture'),
  validateBody(userValidation.schemas.uploadProfilePictureBody),
  userController.uploadProfilePicture
);

// 🎯 RESEND VERIFICATION EMAIL - POST /api/users/profile/resend-verification
router.post(
  '/profile/resend-verification',
  userController.resendVerificationEmail
);

// 🎯 LẤY USER THEO ID - GET /api/users/:userId
router.get(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserById
);

// 🎯 LẤY USER THEO EMAIL - GET /api/users/email/:email
router.get(
  '/email/:email',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(userValidation.schemas.userEmailParams),
  userController.getUserByEmail
);

// 🎯 CẬP NHẬT USER - PUT /api/users/:userId
router.put(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.updateUserBody
  }),
  userController.updateUser
);

// 🎯 VÔ HIỆU HÓA USER - PATCH /api/users/:userId/disable
router.patch(
  '/:userId/disable',
  rbacRequirePermission(PERMISSIONS.DISABLE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.disableUserBody
  }),
  userController.disableUser
);

// 🎯 KÍCH HOẠT LẠI USER - PATCH /api/users/:userId/enable
router.patch(
  '/:userId/enable',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.enableUser
);

// 🎯 GÁN ROLE CHO USER - PATCH /api/users/:userId/role
router.patch(
  '/:userId/role',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.assignRoleBody
  }),
  userController.assignRole
);

// 🎯 LẤY PERMISSIONS CỦA USER - GET /api/users/:userId/permissions
router.get(
  '/:userId/permissions',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserPermissions
);

// 🎯 KIỂM TRA QUYỀN USER - POST /api/users/:userId/check-permission
router.post(
  '/:userId/check-permission',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.checkUserPermissionBody
  }),
  userController.checkUserPermission
);

// 🎯 XÓA USER (SOFT DELETE) - DELETE /api/users/:userId
router.delete(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.DELETE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.deleteUserBody
  }),
  userController.deleteUser
);

// 🎯 KHÔI PHỤC USER ĐÃ XÓA - PATCH /api/users/:userId/restore
router.patch(
  '/:userId/restore',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.restoreUser
);

// 🎯 DANH SÁCH USER ĐÃ XÓA - GET /api/users/deleted/list
router.get(
  '/deleted/list',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateQuery(userValidation.schemas.listUsersQuery),
  userController.listDeletedUsers
);

// 🎯 THỐNG KÊ USER - GET /api/users/stats/overview
router.get(
  '/stats/overview',
  rbacRequirePermission(PERMISSIONS.VIEW_REPORTS),
  userController.getUserStatistics
);

// 🎯 VERIFY EMAIL - POST /api/users/verify-email
router.post(
  '/verify-email',
  validateBody(userValidation.schemas.verifyEmailBody),
  userController.verifyEmail
);

module.exports = router;