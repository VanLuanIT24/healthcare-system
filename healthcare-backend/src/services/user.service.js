// src/services/user.service.js
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const { ROLES, hasPermission, canCreateRole, getRolePermissions, ROLE_HIERARCHY } = require('../constants/roles');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const EmailService = require('../utils/email');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

class UserService {
  async createUser(userData, currentUser) {
    try {
      if (!currentUser) currentUser = { role: ROLES.GUEST }; // Cho self-register

      if (currentUser.role !== ROLES.SUPER_ADMIN && !canCreateRole(currentUser.role, userData.role)) {
        throw new AppError(`Bạn không có quyền tạo user với vai trò ${userData.role}`, 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);
      }

      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new AppError('Email đã tồn tại', 400, ERROR_CODES.USER_EMAIL_EXISTS);
      }

      const user = new User({
        ...userData,
        email: userData.email.toLowerCase(),
        status: 'ACTIVE',
        createdBy: currentUser._id || null
      });

      await user.save();

      if (userData.role === ROLES.PATIENT) {
        await this.createPatientProfile(user);
      }

      await EmailService.sendWelcomeEmail(user);

      const userResponse = user.toObject();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  async createPatientProfile(user) {
    const patientId = `PAT${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    const patient = new Patient({
      userId: user._id,
      patientId,
      preferences: { preferredLanguage: 'vi', communicationMethod: 'EMAIL', privacyLevel: 'STANDARD' }
    });
    await patient.save();
  }

  async getUserById(userId, includeSensitive = false) {
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil');
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    const userData = user.toObject();
    if (!includeSensitive) {
      delete userData.personalInfo?.emergencyContact;
      delete userData.professionalInfo?.licenseNumber;
    }
    return userData;
  }

  async updateUser(userId, updateData, currentUser) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (ROLE_HIERARCHY.indexOf(user.role) < ROLE_HIERARCHY.indexOf(currentUser.role)) {
      throw new AppError('Không có quyền cập nhật user cao cấp hơn', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);
    }

    Object.assign(user, updateData);
    user.lastModifiedBy = currentUser._id;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    return updatedUser;
  }

  async disableUser(userId, reason, currentUser) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (user._id.toString() === currentUser._id.toString()) throw new AppError('Không thể vô hiệu hóa chính mình', 400, ERROR_CODES.OPERATION_NOT_ALLOWED);
    if (ROLE_HIERARCHY.indexOf(user.role) < ROLE_HIERARCHY.indexOf(currentUser.role)) throw new AppError('Không có quyền vô hiệu hóa user cao cấp hơn', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);

    user.status = 'INACTIVE';
    user.isActive = false;
    user.lastModifiedBy = currentUser._id;
    await user.save();
  }

  async listUsers(filter = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const query = { ...filter, isDeleted: false };

    const users = await User.find(query).select('-password').sort(sort).skip(skip).limit(limit).lean();
    const total = await User.countDocuments(query);

    return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil');
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);
    return user.toObject();
  }

  async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    Object.assign(user, updateData);
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    return updatedUser;
  }

  async assignRole(userId, newRole, currentUser) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (currentUser.role !== ROLES.SUPER_ADMIN && !canCreateRole(currentUser.role, newRole)) {
      throw new AppError(`Không có quyền gán role ${newRole}`, 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);
    }

    user.role = newRole;
    user.lastModifiedBy = currentUser._id;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    return updatedUser;
  }

  async getUserPermissions(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    return getRolePermissions(user.role);
  }

  async enableUser(userId, currentUser) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (ROLE_HIERARCHY.indexOf(user.role) < ROLE_HIERARCHY.indexOf(currentUser.role)) throw new AppError('Không có quyền kích hoạt user cao cấp hơn', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);

    user.status = 'ACTIVE';
    user.isActive = true;
    user.lastModifiedBy = currentUser._id;
    await user.save();

    await EmailService.sendAccountActivatedEmail(user);

    const updatedUser = user.toObject();
    delete updatedUser.password;
    return updatedUser;
  }

  async deleteUser(userId, reason, currentUser) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (user._id.toString() === currentUser._id.toString()) throw new AppError('Không thể xóa chính mình', 400, ERROR_CODES.OPERATION_NOT_ALLOWED);
    if (ROLE_HIERARCHY.indexOf(user.role) < ROLE_HIERARCHY.indexOf(currentUser.role)) throw new AppError('Không có quyền xóa user cao cấp hơn', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);

    user.softDelete(currentUser._id, reason);
    await user.save();

    await this.cleanupUserData(userId);
  }

  async cleanupUserData(userId) {
    // Cleanup patient if exists
    await Patient.findOneAndUpdate({ userId }, { isDeleted: true, deletedAt: new Date(), status: 'DELETED' });
  }

  async restoreUser(userId, currentUser) {
    const user = await User.findById(userId);
    if (!user || !user.isDeleted) throw new AppError('Không tìm thấy user đã xóa', 404, ERROR_CODES.USER_NOT_FOUND);

    if (currentUser.role !== ROLES.SUPER_ADMIN && ROLE_HIERARCHY.indexOf(user.role) < ROLE_HIERARCHY.indexOf(currentUser.role)) throw new AppError('Không có quyền khôi phục user cao cấp hơn', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS);

    user.restore(currentUser._id);
    await user.save();

    await this.restoreUserData(userId);

    const restoredUser = user.toObject();
    delete restoredUser.password;
    return restoredUser;
  }

  async restoreUserData(userId) {
    await Patient.findOneAndUpdate({ userId }, { isDeleted: false, deletedAt: undefined, status: 'ACTIVE' });
  }

  async listDeletedUsers(options = {}) {
    const { page = 1, limit = 10, sortBy = 'deletedAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const users = await User.find({ isDeleted: true }).select('-password').sort(sort).skip(skip).limit(limit).lean();
    const total = await User.countDocuments({ isDeleted: true });

    return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async uploadProfilePicture(userId, file) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (user.personalInfo.profilePicture) {
      const oldPath = path.join(__dirname, '../../uploads/profiles', user.personalInfo.profilePicture);
      await fs.unlink(oldPath).catch(() => {});
    }

    user.personalInfo.profilePicture = file.filename;
    await user.save();
    return user;
  }

  async verifyEmail(token) {
    const user = await User.findByVerificationToken(token);
    if (!user) throw new AppError('Token không hợp lệ hoặc hết hạn', 400, ERROR_CODES.VALIDATION_FAILED);

    user.verifyEmail();
    await user.save();
    return user;
  }

  async resendVerificationEmail(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);
    if (user.isEmailVerified) throw new AppError('Email đã xác thực', 400, ERROR_CODES.OPERATION_NOT_ALLOWED);

    const token = user.generateEmailVerificationToken();
    await user.save();
    await EmailService.sendVerificationEmail(user, token);

    return { email: user.email };
  }

  async getUserStatistics() {
    return await User.getUserStats();
  }

  async searchUsers(query) {
    return await this.listUsers({ $text: { $search: query } });
  }

  async getUsersByRole(role) {
    return await this.listUsers({ role });
  }

  async getUsersByDepartment(department) {
    return await this.listUsers({ 'professionalInfo.department': department });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);

    if (!(await user.comparePassword(oldPassword))) throw new AppError('Mật khẩu cũ không đúng', 400, ERROR_CODES.AUTH_INVALID_CREDENTIALS);

    user.password = newPassword; // Pre-save sẽ hash
    await user.save();
  }
}

module.exports = new UserService();