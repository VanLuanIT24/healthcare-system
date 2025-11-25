// src/controllers/user.controller.js
const userService = require('../services/user.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const { uploadFile, deleteFile } = require('../utils/fileUpload');
const EmailService = require('../utils/email');

class UserController {
async createUser(req, res, next) {
  try {
    const userData = req.body;
    const currentUser = req.user; // Đây là thông tin user đã authenticated
    
    console.log('🎯 [USER CONTROLLER] Creating user:', {
      email: userData.email,
      role: userData.role,
      creator: currentUser.email,
      creatorRole: currentUser.role,
      creatorId: currentUser._id
    });

    // 🎯 TRUYỀN currentUser (KHÔNG PHẢI CHỈ _id)
    const user = await userService.createUser(userData, currentUser);
    
    // 🎯 AUDIT LOG
    await auditLog(AUDIT_ACTIONS.USER_CREATE, {
      metadata: { 
        createdUserId: user._id, 
        role: user.role,
        email: user.email,
        createdBy: currentUser._id
      }
    })(req, res, () => {});
    
    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * 🎯 LẤY USER THEO ID
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const includeSensitive = req.user.role === 'SUPER_ADMIN';
      
      console.log('🎯 [USER CONTROLLER] Getting user by ID:', userId);

      const user = await userService.getUserById(userId, includeSensitive);
      
      if (!user) {
        throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT USER
   */
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const updaterId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Updating user:', userId);

      const user = await userService.updateUser(userId, updateData, updaterId);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId,
          updatedFields: Object.keys(updateData),
          updatedBy: updaterId
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Cập nhật user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 VÔ HIỆU HÓA USER
   */
  async disableUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const disablerId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Disabling user:', userId);

      await userService.disableUser(userId, reason, disablerId);
      
      await auditLog(AUDIT_ACTIONS.USER_DISABLE, {
        metadata: { 
          disabledUserId: userId, 
          reason,
          disabledBy: disablerId
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Vô hiệu hóa user thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 DANH SÁCH USER
   */
  async listUsers(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        search,
        status = 'ACTIVE',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeDeleted = false
      } = req.query;
      
      console.log('🎯 [USER CONTROLLER] Listing users with filters:', {
        page, limit, role, search, status
      });

      const filter = { status };
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (includeDeleted === 'true') {
        delete filter.status; // Include all status when viewing deleted
      } else {
        filter.isDeleted = false;
      }
      
      const result = await userService.listUsers(filter, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN PROFILE
   */
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Getting user profile:', userId);

      const user = await userService.getUserProfile(userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT PROFILE
   */
  async updateUserProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      console.log('🎯 [USER CONTROLLER] Updating user profile:', userId);

      const user = await userService.updateUserProfile(userId, updateData);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId, 
          selfUpdate: true,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Cập nhật profile thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

async assignRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user; // Lấy toàn bộ user object
    
    console.log('🎯 [USER CONTROLLER] Assigning role:', { 
      userId, 
      role,
      currentUser: currentUser.email,
      currentUserRole: currentUser.role
    });

    // 🎯 TRUYỀN currentUser (KHÔNG PHẢI CHỈ _id)
    const user = await userService.assignRole(userId, role, currentUser);
    
    await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
      metadata: { 
        updatedUserId: userId, 
        newRole: role,
        assignedBy: currentUser._id
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: `Gán role ${role} thành công`,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * 🎯 LẤY PERMISSIONS CỦA USER
   */
  async getUserPermissions(req, res, next) {
    try {
      const { userId } = req.params;
      
      console.log('🎯 [USER CONTROLLER] Getting user permissions:', userId);

      const permissions = await userService.getUserPermissions(userId);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 KIỂM TRA QUYỀN USER
   */
  async checkUserPermission(req, res, next) {
    try {
      const { userId } = req.params;
      const { permission } = req.body;
      
      console.log('🎯 [USER CONTROLLER] Checking user permission:', { userId, permission });

      const hasPermission = await userService.checkUserPermission(userId, permission);
      
      res.json({
        success: true,
        data: { hasPermission }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 KÍCH HOẠT LẠI USER
   */
  async enableUser(req, res, next) {
    try {
      const { userId } = req.params;
      const enablerId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Enabling user:', userId);
      
      const user = await userService.enableUser(userId, enablerId);
      
      await auditLog(AUDIT_ACTIONS.USER_ENABLE, {
        metadata: { 
          enabledUserId: userId, 
          enabledBy: enablerId,
          newStatus: 'ACTIVE'
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Kích hoạt user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 XÓA USER (SOFT DELETE)
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const deleterId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Deleting user:', userId);

      await userService.deleteUser(userId, reason, deleterId);
      
      await auditLog(AUDIT_ACTIONS.USER_DELETE, {
        metadata: { 
          deletedUserId: userId, 
          reason,
          deletedBy: deleterId,
          deletionType: 'SOFT_DELETE'
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Xóa user thành công'
      });
    } catch (error) {
      next(error);
    }
  }

async restoreUser(req, res, next) {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    console.log('🎯 [USER CONTROLLER] Restoring user:', {
      userId,
      currentUser: currentUser.email,
      currentUserRole: currentUser.role
    });

    // 🎯 TRUYỀN currentUser
    const user = await userService.restoreUser(userId, currentUser);
    
    await auditLog(AUDIT_ACTIONS.USER_RESTORE, {
      metadata: { 
        restoredUserId: userId, 
        restoredBy: currentUser._id
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: 'Khôi phục user thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * 🎯 LẤY DANH SÁCH USER ĐÃ XÓA
   */
  async listDeletedUsers(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10,
        sortBy = 'deletedAt',
        sortOrder = 'desc'
      } = req.query;
      
      console.log('🎯 [USER CONTROLLER] Listing deleted users');

      const result = await userService.listDeletedUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 UPLOAD PROFILE PICTURE
   */
  async uploadProfilePicture(req, res, next) {
    try {
      const userId = req.user._id;
      
      if (!req.file) {
        throw new AppError('Không có file được tải lên', 400, ERROR_CODES.VALIDATION_FAILED);
      }

      console.log('🎯 [USER CONTROLLER] Uploading profile picture:', {
        userId,
        filename: req.file.filename,
        originalname: req.file.originalname
      });

      const user = await userService.uploadProfilePicture(userId, req.file);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId, 
          action: 'UPLOAD_PROFILE_PICTURE',
          filename: req.file.filename
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Tải lên ảnh đại diện thành công',
        data: {
          profilePicture: user.personalInfo.profilePicture,
          profilePictureUrl: user.profilePictureUrl
        }
      });
    } catch (error) {
      // Xóa file nếu có lỗi
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  /**
   * 🎯 VERIFY EMAIL
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      
      console.log('🎯 [USER CONTROLLER] Verifying email with token');

      const user = await userService.verifyEmail(token);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: user._id, 
          action: 'EMAIL_VERIFICATION',
          verified: true
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Xác thực email thành công',
        data: { email: user.email, isEmailVerified: true }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 RESEND VERIFICATION EMAIL
   */
  async resendVerificationEmail(req, res, next) {
    try {
      const userId = req.user._id;
      
      console.log('🎯 [USER CONTROLLER] Resending verification email:', userId);

      const result = await userService.resendVerificationEmail(userId);
      
      res.json({
        success: true,
        message: 'Đã gửi lại email xác thực',
        data: { email: result.email }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GET USER STATISTICS
   */
  async getUserStatistics(req, res, next) {
    try {
      console.log('🎯 [USER CONTROLLER] Getting user statistics');

      const stats = await userService.getUserStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GET USER BY EMAIL (INTERNAL/ADMIN)
   */
  async getUserByEmail(req, res, next) {
    try {
      const { email } = req.params;
      
      console.log('🎯 [USER CONTROLLER] Getting user by email:', email);

      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        throw new AppError('Không tìm thấy user với email này', 404, ERROR_CODES.USER_NOT_FOUND);
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();