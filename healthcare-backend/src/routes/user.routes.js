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
const { PERMISSIONS } = require('../constants/roles');

// 🔐 TẤT CẢ ROUTES ĐỀU YÊU CẦU XÁC THỰC
router.use(authenticate);

// 👥 USER MANAGEMENT ROUTES - ĐÃ SỬA LỖI VALIDATION

// 🎯 TẠO USER MỚI - POST /api/users
router.post(
  '/',
  rbacRequirePermission(PERMISSIONS['USER.CREATE']),
  validateBody(userValidation.schemas.createUserBody),
  userController.createUser
);

// 🎯 DANH SÁCH USER - GET /api/users
router.get(
  '/',
  rbacRequirePermission(PERMISSIONS['USER.VIEW']),
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

// 🎯 LẤY USER THEO ID - GET /api/users/:userId
router.get(
  '/:userId',
  rbacRequirePermission(PERMISSIONS['USER.VIEW']),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserById
);

// 🎯 CẬP NHẬT USER - PUT /api/users/:userId
router.put(
  '/:userId',
  rbacRequirePermission(PERMISSIONS['USER.UPDATE']),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.updateUserBody
  }),
  userController.updateUser
);

// 🎯 VÔ HIỆU HÓA USER - PATCH /api/users/:userId/disable
router.patch(
  '/:userId/disable',
  rbacRequirePermission(PERMISSIONS['USER.DISABLE']),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.disableUserBody
  }),
  userController.disableUser
);

// 🎯 GÁN ROLE CHO USER - PATCH /api/users/:userId/role
router.patch(
  '/:userId/role',
  rbacRequirePermission(PERMISSIONS['USER.MANAGE']),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.assignRoleBody
  }),
  userController.assignRole
);

// 🎯 LẤY PERMISSIONS CỦA USER - GET /api/users/:userId/permissions
router.get(
  '/:userId/permissions',
  rbacRequirePermission(PERMISSIONS['USER.VIEW']),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserPermissions
);

// 🎯 KIỂM TRA QUYỀN USER - POST /api/users/:userId/check-permission
router.post(
  '/:userId/check-permission',
  rbacRequirePermission(PERMISSIONS['USER.VIEW']),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.checkUserPermissionBody
  }),
  userController.checkUserPermission
);

module.exports = router;