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
const { PERMISSIONS, ROLES } = require('../constants/roles');

// 🔐 TẤT CẢ ROUTES ĐỀU YÊU CẦU XÁC THỰC
router.use(authenticate);

// 👥 USER MANAGEMENT ROUTES - ĐÃ TỐI ƯU PHÂN QUYỀN

// 🎯 TẠO USER MỚI - POST /api/users
router.post(
  '/',
  // Middleware dynamic để kiểm tra quyền tạo user theo role
  (req, res, next) => {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role là bắt buộc'
      });
    }

    // Map role to corresponding permission - ĐÃ BỔ SUNG
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
      [ROLES.SUPER_ADMIN]: PERMISSIONS.REGISTER_HOSPITAL_ADMIN // SUPER_ADMIN có thể tạo HOSPITAL_ADMIN
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

// 🎯 LẤY USER THEO ID - GET /api/users/:userId
router.get(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.VIEW_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.getUserById
);

// 🎯 CẬP NHẬT USER - PUT /api/users/:userId
router.put(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER), // Sửa thành UPDATE_USER thống nhất
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

// 🎯 KÍCH HOẠT LẠI USER - PATCH /api/users/:userId/enable
router.patch(
  '/:userId/enable',
  rbacRequirePermission(PERMISSIONS.UPDATE_USER),
  validateParams(userValidation.schemas.userIdParams),
  userController.enableUser
);


// 🎯 XÓA USER (SOFT DELETE) - DELETE /api/users/:userId
router.delete(
  '/:userId',
  rbacRequirePermission(PERMISSIONS.DELETE_USER),
  validateCombined({
    params: userValidation.schemas.userIdParams,
    body: userValidation.schemas.disableUserBody // Dùng chung schema với disable
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

module.exports = router;