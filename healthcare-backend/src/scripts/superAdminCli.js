#!/usr/bin/env node
/**
 * 🎯 SUPER ADMIN CLI TOOL - HEALTHCARE SYSTEM
 * Công cụ dòng lệnh để quản lý Super Admin
 * Author: Healthcare System Team
 */

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const mongoose = require('mongoose');
const SuperAdminService = require('../services/superAdmin.service');
const { appConfig } = require('../config');

class SuperAdminCLI {
  constructor() {
    this.commands = {
      'create': 'Tạo Super Admin mới',
      'status': 'Kiểm tra trạng thái Super Admin',
      'reset': 'Reset Super Admin (development only)',
      'info': 'Hiển thị thông tin chi tiết Super Admin',
      'help': 'Hiển thị trợ giúp'
    };
    
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    };
  }

  async run() {
    const command = process.argv[2] || 'help';

    try {
      this.showBanner();
      
      // Kiểm tra biến môi trường
      this.validateEnvironment();

      // Kết nối database
      await this.connectDatabase();

      switch (command) {
        case 'create':
          await this.handleCreate();
          break;
        case 'status':
          await this.handleStatus();
          break;
        case 'reset':
          await this.handleReset();
          break;
        case 'info':
          await this.handleInfo();
          break;
        case 'help':
        default:
          this.showHelp();
      }

    } catch (error) {
      this.logError('Lỗi:', error.message);
      process.exit(1);
    } finally {
      await this.disconnectDatabase();
    }
  }

  async connectDatabase() {
    try {
      this.logInfo('🔄 Đang kết nối database...');
      
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      this.logSuccess('✅ Đã kết nối database thành công');
    } catch (error) {
      throw new Error(`Không thể kết nối database: ${error.message}`);
    }
  }

  async disconnectDatabase() {
    try {
      await mongoose.disconnect();
      this.logSuccess('✅ Đã ngắt kết nối database');
    } catch (error) {
      this.logError('⚠️ Cảnh báo khi ngắt kết nối database:', error.message);
    }
  }

  validateEnvironment() {
    const requiredEnvVars = [
      'MONGO_URI',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_PASSWORD',
      'SUPER_ADMIN_NAME'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Thiếu biến môi trường: ${missingVars.join(', ')}`);
    }

    this.logInfo(`🌍 Môi trường: ${process.env.NODE_ENV || 'development'}`);
  }

  async handleCreate() {
    this.logInfo('🔄 Đang tạo Super Admin...');
    
    const admin = await SuperAdminService.createNewSuperAdmin();
    
    this.logSuccess('✅ ĐÃ TẠO SUPER ADMIN THÀNH CÔNG!');
    console.log('');
    console.log(`${this.colors.bright}📧 Email:${this.colors.reset} ${admin.email}`);
    console.log(`${this.colors.bright}👤 Tên:${this.colors.reset} ${admin.personalInfo.firstName + ' ' + admin.personalInfo.lastName}`);
    console.log(`${this.colors.bright}🎯 Vai trò:${this.colors.reset} ${admin.role}`);
    console.log(`${this.colors.bright}📊 Trạng thái:${this.colors.reset} ${admin.status}`);
    console.log(`${this.colors.bright}🆔 ID:${this.colors.reset} ${admin._id}`);
    console.log('');
    
    this.showSecurityNotice();
  }


async handleStatus() {
  const status = await SuperAdminService.getSuperAdminStatus();
  
  if (status.exists) {
    this.logSuccess('✅ SUPER ADMIN ĐANG HOẠT ĐỘNG');
    console.log('');
    console.log(`${this.colors.bright}📧 Email:${this.colors.reset} ${status.email}`);
    console.log(`${this.colors.bright}👤 Tên:${this.colors.reset} ${status.personalInfo.firstName + ' ' + status.personalInfo.lastName || 'Chưa đặt tên'}`);
    console.log(`${this.colors.bright}🎯 Vai trò:${this.colors.reset} ${status.role || ROLES.SUPER_ADMIN}`);
    console.log(`${this.colors.bright}📊 Trạng thái:${this.colors.reset} ${status.status || 'ACTIVE'}`);
    console.log(`${this.colors.bright}📅 Ngày tạo:${this.colors.reset} ${status.createdAt}`);
    
    if (status.lastLogin) {
      console.log(`${this.colors.bright}🔐 Lần đăng nhập cuối:${this.colors.reset} ${status.lastLogin.at}`);
      console.log(`${this.colors.bright}📍 IP cuối:${this.colors.reset} ${status.lastLogin.ip || 'Không xác định'}`);
    } else {
      console.log(`${this.colors.yellow}🔐 Lần đăng nhập cuối:${this.colors.reset} Chưa đăng nhập`);
    }
  } else {
    this.logWarning('❌ SUPER ADMIN KHÔNG TỒN TẠI');
    console.log('');
    console.log('Chạy lệnh sau để tạo Super Admin:');
    console.log(`${this.colors.cyan}  npm run admin:create${this.colors.reset}`);
  }
}

  async handleReset() {
    // Kiểm tra môi trường production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚫 KHÔNG THỂ RESET SUPER ADMIN TRONG MÔI TRƯỜNG PRODUCTION');
    }

    // Xác nhận reset
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question(
        `${this.colors.red}⚠️  BẠN CÓ CHẮC MUỐN RESET SUPER ADMIN? (y/N): ${this.colors.reset}`,
        resolve
      );
    });

    readline.close();

    if (answer.toLowerCase() !== 'y') {
      this.logInfo('❌ Đã hủy thao tác reset');
      return;
    }

    this.logWarning('🔄 Đang reset Super Admin...');
    await SuperAdminService.resetSuperAdmin();
    this.logSuccess('✅ ĐÃ RESET SUPER ADMIN THÀNH CÔNG');
  }

  async handleInfo() {
    const status = await SuperAdminService.getSuperAdminStatus();
    
    if (!status.exists) {
      this.logWarning('❌ Super Admin không tồn tại');
      return;
    }

    this.logSuccess('📊 THÔNG TIN CHI TIẾT SUPER ADMIN');
    console.log('');
    
    // Hiển thị thông tin hệ thống
    console.log(`${this.colors.bright}🏥 Hệ thống:${this.colors.reset} ${appConfig.hospital.name}`);
    console.log(`${this.colors.bright}🌍 Môi trường:${this.colors.reset} ${appConfig.env}`);
    console.log(`${this.colors.bright}📡 Database:${this.colors.reset} ${new URL(process.env.MONGO_URI).hostname}`);
    console.log('');
    
    // Hiển thị thông tin admin
    console.log(`${this.colors.cyan}👑 THÔNG TIN ADMIN:${this.colors.reset}`);
    console.log(`  📧 Email: ${status.email}`);
    console.log(`  👤 Tên: ${status.personalInfo.firstName + ' ' + status.personalInfo.lastName}`);
    console.log(`  🎯 Vai trò: ${status.role}`);
    console.log(`  📊 Trạng thái: ${status.status}`);
    console.log(`  📅 Ngày tạo: ${status.createdAt}`);
    console.log(`  🔐 Lần đăng nhập cuối: ${status.lastLogin?.at || 'Chưa đăng nhập'}`);
    
    if (status.lastLogin) {
      console.log(`  📍 IP cuối: ${status.lastLogin.ip || 'Không xác định'}`);
      console.log(`  💻 User Agent: ${status.lastLogin.userAgent || 'Không xác định'}`);
    }
    
    console.log('');
    this.showPermissionsInfo();
  }

  showHelp() {
    console.log(`\n${this.colors.bright}🎯 SUPER ADMIN CLI TOOL - HEALTHCARE SYSTEM${this.colors.reset}`);
    console.log('===============================================');
    
    Object.entries(this.commands).forEach(([cmd, desc]) => {
      console.log(`  ${this.colors.cyan}npm run admin:${cmd.padEnd(8)}${this.colors.reset} - ${desc}`);
    });
    
    console.log('===============================================');
    console.log(`\n${this.colors.yellow}📖 Ví dụ sử dụng:${this.colors.reset}`);
    console.log(`  ${this.colors.cyan}npm run admin:create${this.colors.reset}    - Tạo Super Admin mới`);
    console.log(`  ${this.colors.cyan}npm run admin:status${this.colors.reset}   - Kiểm tra trạng thái`);
    console.log(`  ${this.colors.cyan}npm run admin:info${this.colors.reset}     - Xem thông tin chi tiết`);
    console.log(`\n${this.colors.yellow}🔐 Lưu ý bảo mật:${this.colors.reset}`);
    console.log('  - Chỉ sử dụng trong môi trường development/staging');
    console.log('  - Đảm bảo file .env được bảo vệ an toàn');
    console.log('  - Reset mật khẩu định kỳ trong production\n');
  }

  showBanner() {
    console.log(`\n${this.colors.magenta}
    ╔══════════════════════════════════════════════╗
    ║             HEALTHCARE SYSTEM                ║
    ║              SUPER ADMIN CLI                 ║
    ║                                              ║
    ║         Secure Medical Management            ║
    ╚══════════════════════════════════════════════╝
    ${this.colors.reset}\n`);
  }

  showSecurityNotice() {
    console.log(`\n${this.colors.yellow}⚠️  LƯU Ý BẢO MẬT QUAN TRỌNG:${this.colors.reset}`);
    console.log('─────────────────────────────────────');
    console.log('🔐 1. Lưu trữ thông tin đăng nhập an toàn');
    console.log('🔒 2. Đổi mật khẩu định kỳ');
    console.log('📧 3. Chỉ sử dụng email chính thức');
    console.log('🚫 4. Không chia sẻ thông tin đăng nhập');
    console.log('📋 5. Tuân thủ chính sách bảo mật của bệnh viện');
    console.log('─────────────────────────────────────\n');
  }

  showPermissionsInfo() {
    console.log(`${this.colors.cyan}🔐 QUYỀN HẠN SUPER ADMIN:${this.colors.reset}`);
    console.log('  ✅ Toàn quyền hệ thống');
    console.log('  ✅ Quản lý người dùng và vai trò');
    console.log('  ✅ Truy cập tất cả dữ liệu bệnh nhân');
    console.log('  ✅ Cấu hình hệ thống');
    console.log('  ✅ Xem audit logs');
    console.log('  ✅ Quyền khẩn cấp (Emergency Access)');
    console.log('');
  }

  // Phương thức log với màu sắc
  logSuccess(message) {
    console.log(`${this.colors.green}${message}${this.colors.reset}`);
  }

  logError(message, detail = '') {
    console.log(`${this.colors.red}❌ ${message}${this.colors.reset}`);
    if (detail) console.log(`   ${detail}`);
  }

  logWarning(message) {
    console.log(`${this.colors.yellow}⚠️  ${message}${this.colors.reset}`);
  }

  logInfo(message) {
    console.log(`${this.colors.blue}ℹ️  ${message}${this.colors.reset}`);
  }
}

// Xử lý lỗi toàn cục
process.on('unhandledRejection', (error) => {
  console.error('\n❌ LỖI KHÔNG XỬ LÝ:', error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ LỖI HỆ THỐNG:', error.message);
  process.exit(1);
});

// Chạy CLI
if (require.main === module) {
  new SuperAdminCLI().run();
}

module.exports = SuperAdminCLI;