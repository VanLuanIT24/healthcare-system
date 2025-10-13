// src/models/user.model.js
const mongoose = require('mongoose');

/**
 * SCHEMA XÁC THỰC 2 YẾU TỐ (2FA)
 */
const TwoFASchema = new mongoose.Schema({
  enabled: { 
    type: Boolean, 
    default: false 
  },
  secret: { 
    type: String, 
    default: null // Lưu secret key base32 cho TOTP
  },
});

/**
 * SCHEMA NGƯỜI DÙNG CHÍNH
 */
const UserSchema = new mongoose.Schema({
  // THÔNG TIN ĐĂNG NHẬP
  email: { 
    type: String, 
    unique: true, 
    index: true, 
    required: true,
    lowercase: true, // Chuẩn hóa email
    trim: true
  },
  
  name: { 
    type: String, 
    required: true 
  },
  
  // MẬT KHẨU ĐÃ MÃ HÓA
  passwordHash: { 
    type: String, 
    required: true 
  },
  
  // VAI TRÒ TRONG HỆ THỐNG
  role: { 
    type: String, 
    required: true, 
    default: 'PATIENT',
    index: true
  },
  
  // DANH SÁCH QUYỀN ĐƯỢC TẠO USER
  canCreate: { 
    type: [String], 
    default: [] 
  },
  
  // TRẠNG THÁI TÀI KHOẢN
  status: { 
    type: String, 
    enum: ['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'DEACTIVATED'], 
    default: 'PENDING_VERIFICATION',
    index: true
  },
  
  // NGƯỜI TẠO TÀI KHOẢN (nếu có)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  
  // BẢO MẬT ĐĂNG NHẬP
  failedLoginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Date, 
    default: null 
  },
  
  // XÁC THỰC 2 YẾU TỐ
  twoFA: { 
    type: TwoFASchema, 
    default: () => ({}) 
  },
  
  // THÔNG TIN ĐĂNG NHẬP CUỐI
  lastLogin: {
    ip: String,
    userAgent: String,
    at: Date
  },
  
  // THÔNG TIN BỔ SUNG
  meta: { 
    type: Object, 
    default: {} 
  }
}, { 
  timestamps: true // Tự động thêm createdAt, updatedAt
});

/**
 * VIRTUAL FIELD: KIỂM TRA TÀI KHOẢN CÓ ĐANG BỊ KHÓA
 */
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * MIDDLEWARE TRƯỚC KHI LƯU
 */
UserSchema.pre('save', function(next) {
  // Chuẩn hóa email trước khi lưu
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// 🔹 TẠO INDEX CHO TRUY VẤN HIỆU QUẢ
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);