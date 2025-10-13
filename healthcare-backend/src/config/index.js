// src/config/index.js
const appConfig = require('./app.config');
const connectDatabase = require('./db.config');

/**
 * KHỞI TẠO CẤU HÌNH HỆ THỐNG
 * - Kết nối database
 * - Log thông tin cấu hình
 * 
 * @returns {Promise<void>}
 */
async function initializeConfig() {
  console.log('🚀 Đang khởi tạo cấu hình hệ thống...');
  
  // 🔹 KẾT NỐI DATABASE
  await connectDatabase();

  // 🔹 LOG THÔNG TIN CẤU HÌNH (ẨN THÔNG TIN NHẠY CẢM)
  console.log(`🌍 Môi trường: ${appConfig.env}`);
  console.log(`🧩 JWT Expiry: Access ${appConfig.jwt.accessExpiry} | Refresh ${appConfig.jwt.refreshExpiry}`);
  console.log(`📡 SMTP Host: ${appConfig.email.smtpHost}`);
  console.log(`📊 Log Level: ${appConfig.logging.level}`);
  console.log(`👑 Super Admin: ${appConfig.superAdmin.email}`);

  console.log('✅ Khởi tạo cấu hình hoàn tất');
}

module.exports = {
  appConfig,
  connectDatabase,
  initializeConfig,
};