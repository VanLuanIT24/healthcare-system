// src/config/index.js
const appConfig = require('./app.config');
const connectDatabase = require('./db.config');
const superAdminService = require('../services/superAdmin.service');

/**
 * KHỞI TẠO CẤU HÌNH HỆ THỐNG
 */
async function initializeConfig() {
  console.log('🚀 Đang khởi tạo cấu hình hệ thống...');
  
  // 🔹 KIỂM TRA CẤU HÌNH TRƯỚC KHI SỬ DỤNG
  validateConfig();

  // 🔹 KẾT NỐI DATABASE
  await connectDatabase();

  // 🔹 LOG THÔNG TIN CẤU HÌNH (ẨN THÔNG TIN NHẠY CẢM)
  console.log(`🌍 Môi trường: ${appConfig.env}`);
  console.log(`🧩 JWT Expiry: Access ${appConfig.jwt.accessExpiry} | Refresh ${appConfig.jwt.refreshExpiry}`);
  console.log(`📡 SMTP Host: ${appConfig.email.smtpHost}`);
  console.log(`📊 Log Level: ${appConfig.logging.level}`);
  
  // 🔹 KIỂM TRA SUPER ADMIN CONFIG
  if (appConfig.superAdmin) {
    console.log(`👑 Super Admin: ${appConfig.superAdmin.email}`);
    
    // 🔹 KIỂM TRA TRẠNG THÁI SUPER ADMIN
    try {
      const adminStatus = await superAdminService.getSuperAdminStatus();
      console.log(`🔐 Super Admin Status: ${adminStatus.exists ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (error) {
      console.warn('⚠️ Không thể kiểm tra trạng thái Super Admin:', error.message);
    }
  } else {
    console.warn('⚠️ Cấu hình Super Admin không tồn tại');
  }

  console.log('✅ Khởi tạo cấu hình hoàn tất');
}

/**
 * KIỂM TRA TÍNH HỢP LỆ CỦA CẤU HÌNH
 */
function validateConfig() {
  const requiredFields = [
    'env', 'port', 'db', 'jwt', 'security', 
    'email', 'cors', 'logging'
  ];

  requiredFields.forEach(field => {
    if (!appConfig[field]) {
      throw new Error(`❌ Thiếu cấu hình bắt buộc: ${field}`);
    }
  });

  // Kiểm tra superAdmin config
  if (!appConfig.superAdmin) {
    console.warn('⚠️ Cảnh báo: Không tìm thấy cấu hình Super Admin');
  }
}

module.exports = {
  appConfig,
  connectDatabase,
  initializeConfig,
  validateConfig
};