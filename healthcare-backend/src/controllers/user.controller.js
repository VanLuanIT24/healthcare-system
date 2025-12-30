// src/controllers/user.controller.js
const userService = require('../services/user.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const { deleteFile } = require('../utils/fileUpload');
const { ROLES, getCreatableRoles, getRolePermissions, getPermissionsByGroup, ROLE_HIERARCHY } = require('../constants/roles');
const EmailService = require('../utils/email');

class UserController {
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      const currentUser = req.user;

      console.log('🎯 [USER CONTROLLER] Creating user:', {
        email: userData.email,
        role: userData.role,
        creator: currentUser.email,
        creatorRole: currentUser.role,
        creatorId: currentUser._id
      });

      const user = await userService.createUser(userData, currentUser);

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

  // Các hàm tạo theo role cụ thể (wrapper cho createUser với role fixed)
  async createReceptionist(req, res, next) {
    req.body.role = ROLES.RECEPTIONIST;
    await this.createUser(req, res, next);
  }

  async createBillingStaff(req, res, next) {
    req.body.role = ROLES.BILLING_STAFF;
    await this.createUser(req, res, next);
  }

  async createLabTechnician(req, res, next) {
    req.body.role = ROLES.LAB_TECHNICIAN;
    await this.createUser(req, res, next);
  }

  async createPharmacist(req, res, next) {
    req.body.role = ROLES.PHARMACIST;
    await this.createUser(req, res, next);
  }

  async createNurse(req, res, next) {
    req.body.role = ROLES.NURSE;
    await this.createUser(req, res, next);
  }

  async createDoctor(req, res, next) {
    req.body.role = ROLES.DOCTOR;
    await this.createUser(req, res, next);
  }

  async createDepartmentHead(req, res, next) {
    req.body.role = ROLES.DEPARTMENT_HEAD;
    await this.createUser(req, res, next);
  }

  async createHospitalAdmin(req, res, next) {
    req.body.role = ROLES.HOSPITAL_ADMIN;
    await this.createUser(req, res, next);
  }

  async registerPatient(req, res, next) {
    req.body.role = ROLES.PATIENT;
    // Đối với self-register, currentUser là GUEST hoặc null, nhưng service sẽ handle
    req.user = { role: ROLES.GUEST }; // Fake cho self-register
    await this.createUser(req, res, next);
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const includeSensitive = req.user.role === ROLES.SUPER_ADMIN || req.user.role === ROLES.HOSPITAL_ADMIN;

      console.log('🎯 [USER CONTROLLER] Getting user by ID:', id);

      const user = await userService.getUserById(id, includeSensitive);

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

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updater = req.user;

      console.log('🎯 [USER CONTROLLER] Updating user:', id);

      const user = await userService.updateUser(id, updateData, updater);

      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: id,
          updatedFields: Object.keys(updateData),
          updatedBy: updater._id
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

  async disableUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const disabler = req.user;

      console.log('🎯 [USER CONTROLLER] Disabling user:', id);

      await userService.disableUser(id, reason, disabler);

      await auditLog(AUDIT_ACTIONS.USER_DISABLE, {
        metadata: { 
          disabledUserId: id, 
          reason,
          disabledBy: disabler._id
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

  async listUsers(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [USER CONTROLLER] Listing users with filters:', query);

      const result = await userService.listUsers(query);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

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
      const { id } = req.params;
      const { role } = req.body;
      const currentUser = req.user;

      console.log('🎯 [USER CONTROLLER] Assigning role:', { 
        userId: id, 
        role,
        currentUser: currentUser.email,
        currentUserRole: currentUser.role
      });

      const user = await userService.assignRole(id, role, currentUser);

      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: id, 
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

  async getUserPermissions(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🎯 [USER CONTROLLER] Getting user permissions:', id);

      const permissions = await userService.getUserPermissions(id);

      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  async enableUser(req, res, next) {
    try {
      const { id } = req.params;
      const enabler = req.user;

      console.log('🎯 [USER CONTROLLER] Enabling user:', id);

      const user = await userService.enableUser(id, enabler);

      await auditLog(AUDIT_ACTIONS.USER_ENABLE, {
        metadata: { 
          enabledUserId: id, 
          enabledBy: enabler._id,
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

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const deleter = req.user;

      console.log('🎯 [USER CONTROLLER] Deleting user:', id);

      await userService.deleteUser(id, reason, deleter);

      await auditLog(AUDIT_ACTIONS.USER_DELETE, {
        metadata: { 
          deletedUserId: id, 
          reason,
          deletedBy: deleter._id,
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
      const { id } = req.params;
      const currentUser = req.user;

      console.log('🎯 [USER CONTROLLER] Restoring user:', {
        userId: id,
        currentUser: currentUser.email,
        currentUserRole: currentUser.role
      });

      const user = await userService.restoreUser(id, currentUser);

      await auditLog(AUDIT_ACTIONS.USER_RESTORE, {
        metadata: { 
          restoredUserId: id, 
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

  async listDeletedUsers(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [USER CONTROLLER] Listing deleted users');

      const result = await userService.listDeletedUsers(query);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

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
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

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

  async searchUsers(req, res, next) {
    try {
      const { q } = req.query;

      console.log('🎯 [USER CONTROLLER] Searching users:', q);

      const result = await userService.searchUsers(q);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByRole(req, res, next) {
    try {
      const { role } = req.query; // Vì trong routes dùng query

      console.log('🎯 [USER CONTROLLER] Getting users by role:', role);

      const result = await userService.getUsersByRole(role);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByDepartment(req, res, next) {
    try {
      const { department } = req.query;

      console.log('🎯 [USER CONTROLLER] Getting users by department:', department);

      const result = await userService.getUsersByDepartment(department);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Hỗ trợ UI: Roles & Permissions
  async getRoles(req, res, next) {
    try {
      res.json({
        success: true,
        data: ROLES
      });
    } catch (error) {
      next(error);
    }
  }

  async getCreatableRoles(req, res, next) {
    try {
      const currentRole = req.user.role;
      const creatable = getCreatableRoles(currentRole);
      res.json({
        success: true,
        data: creatable
      });
    } catch (error) {
      next(error);
    }
  }

  async getPermissionsByRole(req, res, next) {
    try {
      const { role } = req.params;
      const permissions = getRolePermissions(role);
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPermissions(req, res, next) {
    try {
      const grouped = getPermissionsByGroup();
      res.json({
        success: true,
        data: grouped
      });
    } catch (error) {
      next(error);
    }
  }

  // Thay đổi mật khẩu
  async changePassword(req, res, next) {
    try {
      const userId = req.user._id;
      const { oldPassword, newPassword } = req.body;

      console.log('🎯 [USER CONTROLLER] Changing password for user:', userId);

      await userService.changePassword(userId, oldPassword, newPassword);

      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId, 
          action: 'CHANGE_PASSWORD'
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Thay đổi mật khẩu thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();