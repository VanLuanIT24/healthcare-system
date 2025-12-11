// src/config/index.js
// ✅ FIX: Tránh circular dependency bằng cách import trực tiếp từ app.config.js
const { config: appConfig } = require('./app.config');
const connectDatabase = require('./db.config');

async function initializeConfig() {
  console.log('🚀 Đang khởi tạo cấu hình hệ thống...');

  validateConfig();

  await connectDatabase();

  console.log(`🌍 Môi trường: ${appConfig.env}`);
  console.log(`🧩 JWT Expiry: Access ${appConfig.jwt.accessExpiry} | Refresh ${appConfig.jwt.refreshExpiry}`);
  console.log(`📡 SMTP Host: ${appConfig.email.smtpHost}`);
  console.log(`📊 Log Level: ${appConfig.logging.level}`);
  console.log(`🏥 Hospital: ${appConfig.hospital.name}`);

  if (appConfig.superAdmin) {
    console.log(`👑 Super Admin Email: ${appConfig.superAdmin.email}`);

    try {
      // ✅ FIX: Lazy loading service để tránh circular dependency
      const superAdminService = require('../services/superAdmin.service');
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

function validateConfig() {
  const requiredFields = [
    'env', 'port', 'db', 'jwt', 'security', 'email', 'cors', 'logging'
  ];

  requiredFields.forEach(field => {
    if (!appConfig[field]) {
      throw new Error(`❌ Thiếu cấu hình bắt buộc: ${field}`);
    }
  });

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
