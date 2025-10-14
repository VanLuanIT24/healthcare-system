#!/usr/bin/env node
// src/scripts/superAdminCli.js
require('dotenv').config();
const mongoose = require('mongoose');
const SuperAdminService = require('../services/superAdmin.service');

class SuperAdminCLI {
  constructor() {
    this.commands = {
      'create': 'Tạo Super Admin mới',
      'status': 'Kiểm tra trạng thái Super Admin',
      'reset': 'Reset Super Admin (development only)',
      'help': 'Hiển thị trợ giúp'
    };
  }

  async run() {
    const command = process.argv[2] || 'help';

    try {
      // Kết nối database
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Đã kết nối database');

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
        case 'help':
        default:
          this.showHelp();
      }

    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('✅ Đã ngắt kết nối database');
    }
  }

  async handleCreate() {
    console.log('🔄 Đang tạo Super Admin...');
    const admin = await SuperAdminService.createNewSuperAdmin();
    console.log('✅ Đã tạo Super Admin thành công!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🎯 Role: ${admin.role}`);
  }

  async handleStatus() {
    const status = await SuperAdminService.getSuperAdminStatus();
    
    if (status.exists) {
      console.log('✅ Super Admin đang hoạt động');
      console.log(`📧 Email: ${status.email}`);
      console.log(`👤 Name: ${status.name}`);
      console.log(`📊 Status: ${status.status}`);
      console.log(`🕐 Created: ${status.createdAt}`);
      console.log(`🔐 Last Login: ${status.lastLogin?.at || 'Chưa đăng nhập'}`);
    } else {
      console.log('❌ Super Admin không tồn tại');
    }
  }

  async handleReset() {
    if (process.env.NODE_ENV === 'production') {
      console.error('🚫 Không thể reset Super Admin trong production');
      return;
    }
    
    console.log('🔄 Đang reset Super Admin...');
    await SuperAdminService.resetSuperAdmin();
    console.log('✅ Đã reset Super Admin thành công');
  }

  showHelp() {
    console.log('\n🎯 SUPER ADMIN CLI TOOL');
    console.log('=================================');
    Object.entries(this.commands).forEach(([cmd, desc]) => {
      console.log(`  npm run admin:${cmd.padEnd(8)} - ${desc}`);
    });
    console.log('=================================\n');
  }
}

// Chạy CLI
new SuperAdminCLI().run();