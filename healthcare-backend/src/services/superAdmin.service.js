// src/services/superAdmin.service.js
const bcrypt = require('bcryptjs');
const { appConfig } = require('../config');
const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const { ROLES } = require('../constants/roles');

class SuperAdminService {
  /**
   * KIỂM TRA VÀ LẤY CẤU HÌNH SUPER ADMIN
   */
  getSuperAdminConfig() {
    if (!appConfig.superAdmin || !appConfig.superAdmin.email) {
      throw new Error('Cấu hình Super Admin không tồn tại hoặc không hợp lệ');
    }
    return appConfig.superAdmin;
  }

  /**
   * TẠO SUPER ADMIN MỚI
   */
  async createNewSuperAdmin() {
    const superAdminConfig = this.getSuperAdminConfig();
    const { email, password, name } = superAdminConfig;

    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(password, appConfig.security.saltRounds);

    // Tách tên thành firstName và lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'Super';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    // Tạo Super Admin với schema thực tế từ MongoDB
    const superAdmin = new User({
      email: email.toLowerCase(),
      name: name || 'System Root Administrator',
      password: password,
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      loginAttempts: 0,

      // Thông tin cá nhân theo schema thực tế
      personalInfo: {
        firstName: firstName,
        lastName: lastName,
        gender: 'OTHER',
        dateOfBirth: new Date('1980-01-01'),
        phone: appConfig.superAdmin.phone || '+84123456789'
      },

      // Thông tin chuyên môn
      professionalInfo: {
        qualifications: []
      },

      // Cài đặt
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'vi',
        theme: 'light'
      },

      documents: [],

      // Thông tin hệ thống
      systemInfo: {
        isSuperAdmin: true,
        createdBy: 'SYSTEM',
        initializationDate: new Date()
      },

      canCreate: Object.keys(ROLES),
      meta: {
        systemGenerated: true,
        initializedAt: new Date(),
        version: '1.0'
      }
    });

    await superAdmin.save();

    // Ghi log audit với đầy đủ thông tin
    await this.logSuperAdminAction('SYSTEM_INIT', null, superAdmin._id, {
      action: 'CREATE_SUPER_ADMIN',
      source: 'SYSTEM_BOOTSTRAP'
    });

    console.log('🎉 Đã tạo tài khoản Super Admin thành công!');
    this.logSuperAdminCredentials(superAdmin, superAdminConfig);

    // Trả về object với các trường cần thiết cho CLI
    return {
      ...superAdmin.toObject(),
      status: superAdmin.isActive ? 'ACTIVE' : 'INACTIVE' // Thêm trường status cho CLI
    };
  }

  /**
   * CẬP NHẬT SUPER ADMIN HIỆN CÓ
   */
  async updateExistingSuperAdmin(existingAdmin) {
    const superAdminConfig = this.getSuperAdminConfig();
    const { password, name } = superAdminConfig;

    // Cập nhật mật khẩu nếu có thay đổi
    const isPasswordMatch = await bcrypt.compare(password, existingAdmin.passwordHash);

    if (!isPasswordMatch) {
      existingAdmin.passwordHash = await bcrypt.hash(password, appConfig.security.saltRounds);
      existingAdmin.password = password;
      console.log('🔒 Đã cập nhật mật khẩu Super Admin');
    }

    // Cập nhật thông tin
    existingAdmin.name = name || 'System Root Administrator';
    existingAdmin.isActive = true;
    existingAdmin.canCreate = Object.keys(ROLES);
    existingAdmin.meta = {
      ...existingAdmin.meta,
      lastUpdated: new Date(),
      updatedBy: 'SYSTEM'
    };

    await existingAdmin.save();

    await this.logSuperAdminAction('SYSTEM_UPDATE', existingAdmin._id, existingAdmin._id, {
      action: 'UPDATE_SUPER_ADMIN',
      changes: ['password', 'name', 'permissions']
    });

    console.log('✅ Đã cập nhật thông tin Super Admin');

    // Trả về object với các trường cần thiết cho CLI
    return {
      ...existingAdmin.toObject(),
      status: existingAdmin.isActive ? 'ACTIVE' : 'INACTIVE' // Thêm trường status cho CLI
    };
  }

  /**
   * KHỞI TẠO SUPER ADMIN TỰ ĐỘNG
   */
  async initializeSuperAdmin() {
    try {
      console.log('🔍 Đang kiểm tra tài khoản Super Admin...');

      const superAdminConfig = this.getSuperAdminConfig();

      // Kiểm tra Super Admin đã tồn tại chưa
      const existingSuperAdmin = await User.findOne({
        role: ROLES.SUPER_ADMIN,
        email: superAdminConfig.email
      });

      if (existingSuperAdmin) {
        console.log('✅ Super Admin đã tồn tại, đang cập nhật thông tin...');
        return await this.updateExistingSuperAdmin(existingSuperAdmin);
      }

      // Tạo mới Super Admin
      return await this.createNewSuperAdmin();

    } catch (error) {
      console.error('❌ Lỗi khởi tạo Super Admin:', error);
      throw error;
    }
  }

  /**
   * KIỂM TRA TRẠNG THÁI SUPER ADMIN
   */
  async getSuperAdminStatus() {
    try {
      const superAdminConfig = this.getSuperAdminConfig();

      const superAdmin = await User.findOne({
        role: ROLES.SUPER_ADMIN,
        email: superAdminConfig.email
      });

      if (!superAdmin) {
        return {
          exists: false,
          status: 'NOT_FOUND',
          configExists: true
        };
      }

      return {
        exists: true,
        status: superAdmin.isActive ? 'ACTIVE' : 'INACTIVE',
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        personalInfo: superAdmin.personalInfo,
        lastLogin: superAdmin.lastLogin,
        createdAt: superAdmin.createdAt,
        configExists: true
      };
    } catch (error) {
      return {
        exists: false,
        status: 'CONFIG_ERROR',
        configExists: false,
        error: error.message
      };
    }
  }

  /**
   * RESET SUPER ADMIN (FOR DEVELOPMENT/TESTING)
   */
  async resetSuperAdmin() {
    if (appConfig.isProd) {
      throw new Error('Không thể reset Super Admin trong môi trường production');
    }

    console.log('🔄 Đang reset Super Admin...');

    const superAdminConfig = this.getSuperAdminConfig();

    // Xóa Super Admin hiện tại
    await User.deleteOne({
      role: ROLES.SUPER_ADMIN,
      email: superAdminConfig.email
    });

    // Tạo lại
    return await this.createNewSuperAdmin();
  }

  /**
   * GHI LOG AUDIT CHO HÀNH ĐỘNG SUPER ADMIN
   */
  async logSuperAdminAction(action, targetUserId, actorId, meta = {}) {
    if (!appConfig.logging.enableAudit) return;

    try {
      const auditLog = new AuditLog({
        actor: actorId,
        action,
        target: targetUserId,
        ipAddress: '127.0.0.1',
        userAgent: 'System-Bootstrap',
        resource: 'SUPER_ADMIN',
        userRole: ROLES.SUPER_ADMIN,
        meta: {
          ...meta,
          systemAction: true,
          environment: appConfig.env
        }
      });

      await auditLog.save();
    } catch (error) {
      console.warn('⚠️ Không thể ghi audit log:', error.message);
    }
  }

  /**
   * LOG THÔNG TIN ĐĂNG NHẬP (CHỈ HIỂN THỊ TRONG DEVELOPMENT)
   */
  logSuperAdminCredentials(superAdmin, superAdminConfig) {
    if (appConfig.isDev) {
      console.log('\n📋 THÔNG TIN SUPER ADMIN (CHỈ HIỂN THỊ TRONG DEVELOPMENT)');
      console.log('========================================');
      console.log(`📧 Email: ${superAdmin.email}`);
      console.log(`🔑 Password: ${superAdminConfig.password}`);
      console.log(`👤 Name: ${superAdmin.name}`);
      console.log(`👥 Full Name: ${superAdmin.personalInfo.firstName} ${superAdmin.personalInfo.lastName}`);
      console.log(`🎯 Role: ${superAdmin.role}`);
      console.log(`📊 Status: ${superAdmin.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      console.log('========================================\n');
    } else {
      console.log('✅ Super Admin đã được khởi tạo thành công');
    }
  }
}

module.exports = new SuperAdminService();