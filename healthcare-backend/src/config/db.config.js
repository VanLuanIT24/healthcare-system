// src/config/db.config.js
const mongoose = require('mongoose');
// ✅ FIX: Import config object trực tiếp để tránh circular dependency
const { config: appConfig } = require('./app.config');

async function connectDatabase(retryCount = 0) {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000;

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(appConfig.db.uri, {
      maxPoolSize: appConfig.db.maxPoolSize,
      minPoolSize: appConfig.db.minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: appConfig.isDev,
    });

    console.log('✅ Kết nối MongoDB thành công');
    
    // Run migrations after successful connection
    if (retryCount === 0) { // Only on first successful connection
      try {
        const { fixOldIndexes } = require('../utils/migrations');
        await fixOldIndexes();
      } catch (migErr) {
        console.error('⚠️ Migration error (non-critical):', migErr.message);
      }
    }
  } catch (err) {
    console.error(`❌ Kết nối MongoDB thất bại (${retryCount + 1}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔁 Thử lại kết nối sau ${RETRY_DELAY / 1000} giây...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDatabase(retryCount + 1);
    } else {
      console.error('❌ Đã vượt quá số lần thử lại tối đa. Thoát ứng dụng...');
      process.exit(1);
    }
  }

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
