// server.js
const app = require('./app');
const { initializeConfig, appConfig } = require('./src/config');
const { verifyEmailConnection } = require('./src/utils/email');

/**
 * ĐIỂM KHỞI CHẠY ỨNG DỤNG
 * - Khởi tạo cấu hình và kết nối database
 * - Kiểm tra kết nối email service
 * - Khởi động server
 */

(async () => {
  try {
    console.log('🚀 Đang khởi động ứng dụng MediAuth...');
    
    // 🔧 KHỞI TẠO CẤU HÌNH HỆ THỐNG
    await initializeConfig();
    
    // 📧 KIỂM TRA KẾT NỐI EMAIL SERVICE
    if (appConfig.isProd) {
      const emailConnected = await verifyEmailConnection();
      if (!emailConnected) {
        console.warn('⚠️ Không thể kết nối SMTP server. Tính năng email có thể không hoạt động.');
      }
    }

    // 🌐 KHỞI ĐỘNG SERVER
    const server = app.listen(appConfig.port, () => {
      console.log('\n✅ ỨNG DỤNG ĐÃ SẴN SÀNG');
      console.log('=================================');
      console.log(`🌍 Environment: ${appConfig.env}`);
      console.log(`📍 Port: ${appConfig.port}`);
      console.log(`📊 Database: ${appConfig.db.uri ? 'Connected' : 'Disconnected'}`);
      console.log(`📧 SMTP: ${appConfig.email.smtpHost}`);
      console.log(`👑 Super Admin: ${appConfig.superAdmin.email}`);
      console.log('=================================\n');
    });

    // 🎯 XỬ LÝ TẮT ỨNG DỤNG GRACEFULLY
    process.on('SIGTERM', () => {
      console.log('🛑 Nhận tín hiệu SIGTERM, đang tắt server...');
      server.close(() => {
        console.log('✅ Server đã tắt thành công');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Nhận tín hiệu SIGINT, đang tắt server...');
      server.close(() => {
        console.log('✅ Server đã tắt thành công');
        process.exit(0);
      });
    });

    // 🚨 XỬ LÝ UNHANDLED REJECTION
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection tại:', promise, 'lý do:', reason);
      // Không thoát ứng dụng ngay, chỉ log lỗi
    });

    // 🚨 XỬ LÝ UNCAUGHT EXCEPTION
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error);
      process.exit(1); // Thoát ứng dụng vì trạng thái không ổn định
    });

  } catch (error) {
    console.error('❌ Khởi động server thất bại:', error);
    process.exit(1);
  }
})();