const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // ✅ FIX: Removed 'index: true' - sẽ tạo compound index ở dưới
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    // ✅ Note: unique tự động tạo index, không cần khai báo thêm
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  loginAt: {
    type: Date,
    default: Date.now
  },
  logoutAt: Date,
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  logoutReason: {
    type: String,
    enum: ['USER_LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'MANUALLY_REVOKED', 'EXPIRED', 'OTHER'],
    default: 'USER_LOGOUT'
  }
}, {
  timestamps: true
});

// ✅ FIX: Compound indexes chỉ - loại bỏ refreshToken index (đã có unique)
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ loginAt: -1 });

// TTL Index - tự động xóa session cũ sau 30 ngày
sessionSchema.index({ loginAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

module.exports = mongoose.model('Session', sessionSchema);