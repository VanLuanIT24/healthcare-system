// src/services/user.service.js
const User = require("../models/user.model");
const Patient = require("../models/patient.model");
const {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  canCreateRole,
  getRolePermissions,
} = require("../constants/roles");
const { hashPassword, comparePassword } = require("../utils/hash");
const { AppError, ERROR_CODES } = require("../middlewares/error.middleware");
const { auditLog, AUDIT_ACTIONS } = require("../middlewares/audit.middleware");
const EmailService = require("../utils/email");

class UserService {
  /**
   * 🎯 TẠO USER MỚI VỚI RBAC CHECK
   */
  async createUser(userData, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Creating new user:", {
        email: userData.email,
        role: userData.role,
        requestedBy: currentUser.email,
      });

      // 🛡️ KIỂM TRA QUYỀN TẠO ROLE
      if (!canCreateRole(currentUser.role, userData.role)) {
        throw new AppError(
          `Bạn không có quyền tạo user với vai trò ${userData.role}`,
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🎯 KIỂM TRA EMAIL TỒN TẠI
      const existingUser = await User.findOne({
        email: userData.email.toLowerCase(),
      });
      if (existingUser) {
        throw new AppError(
          "Email đã tồn tại trong hệ thống",
          400,
          ERROR_CODES.USER_EMAIL_EXISTS
        );
      }

      // 🎯 VALIDATE PASSWORD STRENGTH
      if (userData.password.length < 8) {
        throw new AppError(
          "Mật khẩu phải có ít nhất 8 ký tự",
          400,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // 🎯 TẠO USER MỚI
      const user = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        role: userData.role,
        status: "ACTIVE",
        createdBy: currentUser._id,
        personalInfo: {
          firstName: userData.personalInfo?.firstName,
          lastName: userData.personalInfo?.lastName,
          dateOfBirth:
            userData.personalInfo?.dateOfBirth || new Date("2000-01-01"),
          gender: userData.personalInfo?.gender || "OTHER",
          phone: userData.personalInfo?.phone || "",
        },
      });

      await user.save();
      console.log("✅ [USER SERVICE] User created successfully:", user._id);

      // 🎯 TẠO PATIENT PROFILE NẾU LÀ BỆNH NHÂN
      if (userData.role === ROLES.PATIENT) {
        await this.createPatientProfile(user);
      }

      // 📧 GỬI EMAIL CHÀO MỪNG
      try {
        await EmailService.sendWelcomeEmail(user);
        console.log("✅ [USER SERVICE] Welcome email sent to:", user.email);
      } catch (emailError) {
        console.error(
          "❌ [USER SERVICE] Failed to send welcome email:",
          emailError.message
        );
        // Không throw error vì đây là feature, không phải core functionality
      }

      // 🎯 TRẢ VỀ USER (KHÔNG BAO GỒM PASSWORD)
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error("❌ [USER SERVICE] Create user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 TẠO PATIENT PROFILE
   */
  async createPatientProfile(user) {
    try {
      const patientId = `PAT${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 5)}`.toUpperCase();

      const patient = new Patient({
        userId: user._id,
        patientId: patientId,
        preferences: {
          preferredLanguage: "vi",
          communicationMethod: "EMAIL",
          privacyLevel: "STANDARD",
        },
      });

      await patient.save();
      console.log("✅ [USER SERVICE] Patient profile created:", patientId);
      return patient;
    } catch (error) {
      console.error("❌ [USER SERVICE] Create patient profile error:", error);
      // Không throw error để không ảnh hưởng đến việc tạo user
    }
  }

  /**
   * 🎯 LẤY USER THEO ID
   */
  async getUserById(userId, includeSensitive = false) {
    try {
      const user = await User.findById(userId).select(
        "-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil"
      );

      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      let userData = user.toObject();

      // 🛡️ ẨN THÔNG TIN NHẠY CẢM NẾU KHÔNG CÓ QUYỀN
      if (!includeSensitive) {
        delete userData.personalInfo?.emergencyContact;
        delete userData.professionalInfo?.licenseNumber;
      }

      return userData;
    } catch (error) {
      console.error("❌ [USER SERVICE] Get user by ID error:", error);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT USER
   */
  async updateUser(userId, updateData, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Updating user:", userId);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KIỂM TRA QUYỀN CẬP NHẬT
      if (
        user.role === ROLES.SUPER_ADMIN &&
        currentUser.role !== ROLES.SUPER_ADMIN
      ) {
        throw new AppError(
          "Không có quyền cập nhật Super Admin",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🛡️ KIỂM TRA QUYỀN CẬP NHẬT ROLE - CHỈ SUPER_ADMIN MỚI ĐƯỢC
      if (updateData.role && updateData.role !== user.role) {
        if (currentUser.role !== ROLES.SUPER_ADMIN) {
          throw new AppError(
            "Chỉ Super Admin mới có quyền thay đổi vai trò người dùng",
            403,
            ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
          );
        }
      }

      // 🎯 CẬP NHẬT CÁC TRƯỜNG CHO PHÉP
      const allowedFields = [
        "personalInfo",
        "professionalInfo",
        "settings",
        "status",
        "role",
      ];

      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          if (
            field === "personalInfo" ||
            field === "professionalInfo" ||
            field === "settings"
          ) {
            user[field] = { ...user[field], ...updateData[field] };
          } else {
            user[field] = updateData[field];
          }
        }
      });

      user.lastModifiedBy = currentUser._id;
      await user.save();

      // 🎯 TRẢ VỀ USER ĐÃ CẬP NHẬT
      const updatedUser = user.toObject();
      delete updatedUser.password;

      console.log("✅ [USER SERVICE] User updated successfully:", userId);
      return updatedUser;
    } catch (error) {
      console.error("❌ [USER SERVICE] Update user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 VÔ HIỆU HÓA USER
   */
  async disableUser(userId, reason, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Disabling user:", userId);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KHÔNG CHO VÔ HIỆU HÓA CHÍNH MÌNH
      if (user._id.toString() === currentUser._id.toString()) {
        throw new AppError(
          "Không thể vô hiệu hóa tài khoản của chính bạn",
          400,
          ERROR_CODES.OPERATION_NOT_ALLOWED
        );
      }

      // 🛡️ KHÔNG CHO VÔ HIỆU HÓA SUPER ADMIN
      if (user.role === ROLES.SUPER_ADMIN) {
        throw new AppError(
          "Không thể vô hiệu hóa Super Admin",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🛡️ KIỂM TRA QUYỀN VÔ HIỆU HÓA ROLE CAO HƠN
      if (ROLE_HIERARCHY[user.role] > ROLE_HIERARCHY[currentUser.role]) {
        throw new AppError(
          "Không có quyền vô hiệu hóa user có role cao hơn",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      user.status = "INACTIVE";
      user.isActive = false;
      user.lastModifiedBy = currentUser._id;
      await user.save();

      console.log("✅ [USER SERVICE] User disabled successfully:", userId);
      return { success: true };
    } catch (error) {
      console.error("❌ [USER SERVICE] Disable user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 DANH SÁCH USER VỚI FILTER VÀ PAGINATION
   */
  async listUsers(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // 🎯 BUILD QUERY
      const query = {};

      if (filter.role) query.role = filter.role;
      if (filter.status) query.status = filter.status;

      if (filter.$or) {
        query.$or = filter.$or;
      }

      // 🎯 THỰC HIỆN QUERY
      const users = await User.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments(query);

      // 🛡️ ẨN THÔNG TIN NHẠY CẢM
      const safeUsers = users.map((user) => {
        const userData = { ...user };
        delete userData.personalInfo?.emergencyContact;
        delete userData.professionalInfo?.licenseNumber;
        return userData;
      });

      return {
        users: safeUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("❌ [USER SERVICE] List users error:", error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN PROFILE
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select(
        "-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil"
      );

      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      return user.toObject();
    } catch (error) {
      console.error("❌ [USER SERVICE] Get user profile error:", error);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT PROFILE
   */
  async updateUserProfile(userId, updateData) {
    try {
      console.log("🎯 [USER SERVICE] Updating user profile:", userId);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🎯 CHỈ CHO PHÉP CẬP NHẬT CÁC TRƯỜNG CỤ THỂ
      const allowedFields = ["personalInfo", "settings"];

      allowedFields.forEach((field) => {
        if (updateData[field]) {
          user[field] = { ...user[field], ...updateData[field] };
        }
      });

      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      console.log(
        "✅ [USER SERVICE] User profile updated successfully:",
        userId
      );
      return updatedUser;
    } catch (error) {
      console.error("❌ [USER SERVICE] Update user profile error:", error);
      throw error;
    }
  }

  /**
   * 🎯 GÁN ROLE CHO USER
   */
  async assignRole(userId, newRole, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Assigning role:", { userId, newRole });

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KIỂM TRA QUYỀN GÁN ROLE
      if (!canCreateRole(currentUser.role, newRole)) {
        throw new AppError(
          `Bạn không có quyền gán role ${newRole}`,
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🛡️ KHÔNG CHO GÁN ROLE SUPER ADMIN
      if (
        newRole === ROLES.SUPER_ADMIN &&
        currentUser.role !== ROLES.SUPER_ADMIN
      ) {
        throw new AppError(
          "Chỉ Super Admin mới có thể gán role Super Admin",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      user.role = newRole;
      user.lastModifiedBy = currentUser._id;
      await user.save();

      console.log("✅ [USER SERVICE] Role assigned successfully:", {
        userId,
        newRole,
      });

      const updatedUser = user.toObject();
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      console.error("❌ [USER SERVICE] Assign role error:", error);
      throw error;
    }
  }

  /**
   * 🎯 LẤY PERMISSIONS CỦA USER
   */
  async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      const permissions = getRolePermissions(user.role);

      return {
        userId: user._id,
        role: user.role,
        permissions: permissions,
        totalPermissions: permissions.length,
      };
    } catch (error) {
      console.error("❌ [USER SERVICE] Get user permissions error:", error);
      throw error;
    }
  }

  /**
   * 🎯 KIỂM TRA QUYỀN USER
   */
  async checkUserPermission(userId, permission) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      const hasPerm = hasPermission(user.role, permission);

      return {
        userId: user._id,
        role: user.role,
        permission: permission,
        hasPermission: hasPerm,
      };
    } catch (error) {
      console.error("❌ [USER SERVICE] Check user permission error:", error);
      throw error;
    }
  }

  /**
   * 🎯 TÌM USER THEO EMAIL (INTERNAL)
   */
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error("❌ [USER SERVICE] Find user by email error:", error);
      throw error;
    }
  }

  /**
   * 🎯 ĐẾM USER THEO ROLE
   */
  async countUsersByRole() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
            },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return stats;
    } catch (error) {
      console.error("❌ [USER SERVICE] Count users by role error:", error);
      throw error;
    }
  }

  async enableUser(userId, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Enabling user:", userId);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KIỂM TRA QUYỀN KÍCH HOẠT
      if (
        user.role === ROLES.SUPER_ADMIN &&
        currentUser.role !== ROLES.SUPER_ADMIN
      ) {
        throw new AppError(
          "Không có quyền kích hoạt Super Admin",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🛡️ KIỂM TRA QUYỀN KÍCH HOẠT ROLE CAO HƠN
      if (
        ROLE_HIERARCHY.indexOf(user.role) <
        ROLE_HIERARCHY.indexOf(currentUser.role)
      ) {
        throw new AppError(
          "Không có quyền kích hoạt user có role cao hơn",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🎯 KIỂM TRA TRẠNG THÁI HIỆN TẠI
      if (user.status === "ACTIVE") {
        throw new AppError(
          "User đã ở trạng thái hoạt động",
          400,
          ERROR_CODES.OPERATION_NOT_ALLOWED
        );
      }

      // 🎯 CẬP NHẬT TRẠNG THÁI
      user.status = "ACTIVE";
      user.isActive = true;
      user.lastModifiedBy = currentUser._id;
      user.activatedAt = new Date();

      // 🎯 RESET LOGIN ATTEMPTS NẾU USER BỊ LOCKED
      if (user.status === "LOCKED") {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
      }

      await user.save();

      // 📧 GỬI EMAIL THÔNG BÁO KÍCH HOẠT
      try {
        await EmailService.sendAccountActivatedEmail(user);
        console.log(
          "✅ [USER SERVICE] Account activated email sent to:",
          user.email
        );
      } catch (emailError) {
        console.error(
          "❌ [USER SERVICE] Failed to send activation email:",
          emailError.message
        );
      }

      console.log("✅ [USER SERVICE] User enabled successfully:", userId);

      const updatedUser = user.toObject();
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      console.error("❌ [USER SERVICE] Enable user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 XÓA USER (SOFT DELETE)
   */
  async deleteUser(userId, reason, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Deleting user:", userId);

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(
          "Không tìm thấy user",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KHÔNG CHO XÓA CHÍNH MÌNH
      if (user._id.toString() === currentUser._id.toString()) {
        throw new AppError(
          "Không thể xóa tài khoản của chính bạn",
          400,
          ERROR_CODES.OPERATION_NOT_ALLOWED
        );
      }

      // 🛡️ KHÔNG CHO XÓA SUPER ADMIN
      if (user.role === ROLES.SUPER_ADMIN) {
        throw new AppError(
          "Không thể xóa Super Admin",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🛡️ KIỂM TRA QUYỀN XÓA ROLE CAO HƠN
      if (
        ROLE_HIERARCHY.indexOf(user.role) <
        ROLE_HIERARCHY.indexOf(currentUser.role)
      ) {
        throw new AppError(
          "Không có quyền xóa user có role cao hơn",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🎯 KIỂM TRA NẾU USER ĐÃ BỊ XÓA
      if (user.isDeleted) {
        throw new AppError(
          "User đã bị xóa trước đó",
          400,
          ERROR_CODES.OPERATION_NOT_ALLOWED
        );
      }

      // 🎯 THỰC HIỆN SOFT DELETE
      user.isDeleted = true;
      user.deletedAt = new Date();
      user.deletedBy = currentUser._id;
      user.deletionReason = reason;
      user.status = "DELETED";
      user.isActive = false;

      // 🎯 ẨN EMAIL ĐỂ CÓ THỂ TÁI SỬ DỤNG
      user.email = `deleted_${Date.now()}_${user.email}`;

      await user.save();

      // 🎯 XÓA CÁC DỮ LIỆU LIÊN QUAN (TÙY THEO YÊU CẦU)
      await this.cleanupUserData(userId);

      console.log("✅ [USER SERVICE] User deleted successfully:", userId);
      return { success: true };
    } catch (error) {
      console.error("❌ [USER SERVICE] Delete user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 DỌN DẸP DỮ LIỆU USER SAU KHI XÓA
   */
  async cleanupUserData(userId) {
    try {
      console.log("🧹 [USER SERVICE] Cleaning up user data:", userId);

      // 🎯 CẬP NHẬT CÁC BẢNG LIÊN QUAN
      // Ví dụ: đánh dấu các bản ghi liên quan là deleted
      const cleanupTasks = [];

      // 🎯 CẬP NHẬT PATIENT PROFILE (NẾU CÓ)
      try {
        const patientUpdate = await Patient.findOneAndUpdate(
          { userId: userId },
          {
            isDeleted: true,
            deletedAt: new Date(),
            status: "DELETED",
          }
        );
        if (patientUpdate) {
          console.log("✅ [USER SERVICE] Patient profile cleaned up");
        }
      } catch (patientError) {
        console.error(
          "❌ [USER SERVICE] Patient cleanup error:",
          patientError.message
        );
      }

      // 🎯 CÓ THỂ THÊM CÁC BẢNG KHÁC Ở ĐÂY:
      // - Medical records
      // - Appointments
      // - Prescriptions
      // - Lab results
      // - Bills

      await Promise.all(cleanupTasks);
      console.log("✅ [USER SERVICE] User data cleanup completed");
    } catch (error) {
      console.error("❌ [USER SERVICE] User data cleanup error:", error);
      // Không throw error để không ảnh hưởng đến quá trình xóa user chính
    }
  }

  /**
   * 🎯 KHÔI PHỤC USER ĐÃ XÓA
   */
  async restoreUser(userId, currentUser) {
    try {
      console.log("🎯 [USER SERVICE] Restoring user:", userId);

      const user = await User.findOne({
        _id: userId,
        isDeleted: true,
      });

      if (!user) {
        throw new AppError(
          "Không tìm thấy user đã xóa hoặc user chưa bị xóa",
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // 🛡️ KIỂM TRA QUYỀN KHÔI PHỤC
      if (!hasPermission(currentUser.role, PERMISSIONS.UPDATE_USER)) {
        throw new AppError(
          "Bạn không có quyền khôi phục user",
          403,
          ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS
        );
      }

      // 🎯 KHÔI PHỤC USER
      const originalEmail = user.email.replace(/^deleted_\d+_/, "");

      // 🎯 KIỂM TRA EMAIL CÓ CÒN TỒN TẠI KHÔNG
      const emailExists = await User.findOne({
        email: originalEmail,
        isDeleted: false,
      });

      if (emailExists) {
        throw new AppError(
          "Email đã được sử dụng bởi user khác, không thể khôi phục",
          400,
          ERROR_CODES.USER_EMAIL_EXISTS
        );
      }

      user.email = originalEmail;
      user.isDeleted = false;
      user.deletedAt = undefined;
      user.deletedBy = undefined;
      user.deletionReason = undefined;
      user.status = "ACTIVE";
      user.isActive = true;
      user.restoredAt = new Date();
      user.restoredBy = currentUser._id;
      user.lastModifiedBy = currentUser._id;

      await user.save();

      // 🎯 KHÔI PHỤC CÁC DỮ LIỆU LIÊN QUAN
      await this.restoreUserData(userId);

      console.log("✅ [USER SERVICE] User restored successfully:", userId);

      const restoredUser = user.toObject();
      delete restoredUser.password;
      return restoredUser;
    } catch (error) {
      console.error("❌ [USER SERVICE] Restore user error:", error);
      throw error;
    }
  }

  /**
   * 🎯 KHÔI PHỤC DỮ LIỆU USER LIÊN QUAN
   */
  async restoreUserData(userId) {
    try {
      console.log("🔄 [USER SERVICE] Restoring user data:", userId);

      // 🎯 KHÔI PHỤC PATIENT PROFILE
      try {
        const patientRestore = await Patient.findOneAndUpdate(
          { userId: userId },
          {
            isDeleted: false,
            deletedAt: undefined,
            status: "ACTIVE",
          }
        );
        if (patientRestore) {
          console.log("✅ [USER SERVICE] Patient profile restored");
        }
      } catch (patientError) {
        console.error(
          "❌ [USER SERVICE] Patient restore error:",
          patientError.message
        );
      }

      console.log("✅ [USER SERVICE] User data restoration completed");
    } catch (error) {
      console.error("❌ [USER SERVICE] User data restoration error:", error);
    }
  }

  /**
   * 🎯 LẤY DANH SÁCH USER ĐÃ XÓA
   */
  async listDeletedUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "deletedAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const query = { isDeleted: true };

      const users = await User.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments(query);

      return {
        users: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("❌ [USER SERVICE] List deleted users error:", error);
      throw error;
    }
  }
}

module.exports = new UserService();
