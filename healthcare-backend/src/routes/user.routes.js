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
  ROLE_HIERARCHY,
  canCreateRole
} = require('../constants/roles');
const { upload } = require('../utils/fileUpload');
const Joi = require('joi');

// 🔐 TẤT CẢ ROUTES ĐỀU YÊU CẦU XÁC THỰC
router.use(authenticate);

// 👥 USER MANAGEMENT ROUTES - FIXED TO MATCH FRONTEND API

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

// 🎯 UPLOAD AVATAR - POST /api/users/avatar (MATCH FRONTEND)
router.post(
  '/avatar',
  upload.single('avatar'),
  userController.uploadProfilePicture
);

// 🎯 RESEND VERIFICATION EMAIL - POST /api/users/:id/resend-verification (MATCH FRONTEND)
router.post(
  '/:id/resend-verification',
  validateParams(userValidation.schemas.userIdParams),
  userController.resendVerificationEmail
);

// 🎯 LẤY USER THEO ID - GET /api/users/:id (CHANGE :userId → :id)
router.get(
  '/:id',
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

// 🎯 CẬP NHẬT USER - PUT /api/users/:id (CHANGE :userId → :id)
router.put(
  '/:id',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.updateUserBody
  }),
  userController.updateUser
);

// 🎯 VÔ HIỆU HÓA USER - PATCH /api/users/:id/disable (CHANGE :userId → :id)
router.patch(
  '/:id/disable',
  rbacRequirePermission(PERMISSIONS.DISABLE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.disableUserBody
  }),
  userController.disableUser
);

// 🎯 KÍCH HOẠT LẠI USER - PATCH /api/users/:id/enable (CHANGE :userId → :id)
router.patch(
  '/:id/enable',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.enableUser
);

// 🎯 GÁN ROLE CHO USER - PATCH /api/users/:id/role (CHANGE :userId → :id)
router.patch(
  '/:id/role',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.assignRoleBody
  }),
  userController.assignRole
);

// 🎯 LẤY PERMISSIONS CỦA USER - GET /api/users/:id/permissions (CHANGE :userId → :id)
router.get(
  '/:id/permissions',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserPermissions
);

// 🎯 KIỂM TRA QUYỀN USER - POST /api/users/:id/check-permission (CHANGE :userId → :id)
router.post(
  '/:id/check-permission',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.checkUserPermissionBody
  }),
  userController.checkUserPermission
);

// 🎯 XÓA USER (SOFT DELETE) - DELETE /api/users/:id (CHANGE :userId → :id)
router.delete(
  '/:id',
  rbacRequirePermission(PERMISSIONS.DELETE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.deleteUserBody
  }),
  userController.deleteUser
);

// 🎯 KHÔI PHỤC USER ĐÃ XÓA - POST /api/users/:id/restore (CHANGE METHOD: PATCH → POST, :userId → :id)
router.post(
  '/:id/restore',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.restoreUser
);

// 🎯 DANH SÁCH USER ĐÃ XÓA - GET /api/users/deleted (CHANGE PATH: /deleted/list → /deleted)
router.get(
  '/deleted',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateQuery(userValidation.schemas.listUsersQuery),
  userController.listDeletedUsers
);

// 🎯 THỐNG KÊ USER - GET /api/users/stats (CHANGE PATH: /stats/overview → /stats)
router.get(
  '/stats',
  rbacRequirePermission(PERMISSIONS.VIEW_REPORTS),
  userController.getUserStatistics
);

// 🎯 VERIFY EMAIL - POST /api/users/verify-email
router.post(
  '/verify-email',
  validateBody(userValidation.schemas.verifyEmailBody),
  userController.verifyEmail
);

// 🎯 SEARCH USERS - GET /api/users/search (NEW ROUTE)
router.get(
  '/search',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateQuery(Joi.object({
    q: Joi.string().min(1).max(100).required()
  })),
  async (req, res, next) => {
    try {
      const { q } = req.query;
      
      console.log('🎯 [USER ROUTE] Searching users:', q);

      const users = await userController.searchUsers(q);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

// 🎯 GET USERS BY ROLE - GET /api/users/by-role (NEW ROUTE)
router.get(
  '/by-role/:role',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(Joi.object({
    role: Joi.string().valid(...Object.values(ROLES)).required()
  })),
  async (req, res, next) => {
    try {
      const { role } = req.params;
      
      console.log('🎯 [USER ROUTE] Getting users by role:', role);

      const users = await userController.getUsersByRole(role);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;