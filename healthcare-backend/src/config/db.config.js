// src/config/db.config.js
const mongoose = require('mongoose');
const appConfig = require('./app.config');

/**
 * KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB
 * - Tự động retry khi kết nối thất bại
 * - Xử lý sự kiện kết nối và ngắt kết nối
 * 
 * @param {number} retryCount - Số lần thử lại hiện tại
 * @returns {Promise<void>}
 */
async function connectDatabase(retryCount = 0) {
  const MAX_RETRIES = 5; // Số lần thử lại tối đa
  const RETRY_DELAY = 5000; // Thời gian chờ giữa các lần thử (ms)

  try {
    // 🔹 CẤU HÌNH MONGOOSE
    mongoose.set('strictQuery', true); // Tránh cảnh báo deprecation
    
    // 🔹 THIẾT LẬP KẾT NỐI
    await mongoose.connect(appConfig.db.uri, {
      maxPoolSize: 20,           // Số kết nối tối đa trong pool
      minPoolSize: 5,            // Số kết nối tối thiểu trong pool
      serverSelectionTimeoutMS: 5000, // Timeout chọn server
      socketTimeoutMS: 45000,    // Timeout socket
      autoIndex: appConfig.env === 'development', // Chỉ tạo index trong development
    });

    console.log('✅ Kết nối MongoDB thành công');

  } catch (err) {
    console.error(`❌ Kết nối MongoDB thất bại (${retryCount + 1}/${MAX_RETRIES}):`, err.message);

    // 🔄 THỬ LẠI KẾT NỐI NẾU CHƯA VƯỢT QUÁ SỐ LẦN CHO PHÉP
    if (retryCount < MAX_RETRIES) {
      console.log(`🔁 Thử lại kết nối sau ${RETRY_DELAY/1000} giây...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDatabase(retryCount + 1);
    } else {
      // 🔴 THOÁT ỨNG DỤNG NẾU KHÔNG THỂ KẾT NỐI
      console.error('❌ Đã vượt quá số lần thử lại tối đa. Thoát ứng dụng...');
      process.exit(1);
    }
  }

  // 🎯 XỬ LÝ SỰ KIỆN KẾT NỐI MONGODB
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB đã ngắt kết nối. Đang thử kết nối lại...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Đã kết nối lại MongoDB thành công');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  });
}

module.exports = connectDatabase;