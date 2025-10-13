// src/models/refreshToken.model.js
const mongoose = require('mongoose');

/**
 * SCHEMA REFRESH TOKEN
 * - Quản lý refresh token cho cơ chế xác thực JWT
 * - Hỗ trợ token rotation để bảo mật
 */
const RefreshTokenSchema = new mongoose.Schema({
  // NGƯỜI DÙNG SỞ HỮU TOKEN
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // TOKEN ĐÃ ĐƯỢC MÃ HÓA (HASH)
  tokenHash: { 
    type: String, 
    required: true,
    unique: true // Đảm bảo token hash là duy nhất
  },
  
  // THÔNG TIN THIẾT BỊ
  device: { 
    type: String, 
    default: 'unknown' 
  },
  
  // ĐỊA CHỈ IP TẠO TOKEN
  ip: { 
    type: String 
  },
  
  // THỜI GIAN TẠO TOKEN
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // THỜI GIAN HẾT HẠN
  expiresAt: { 
    type: Date, 
    required: true 
  },
  
  // TRẠNG THÁI THU HỒI TOKEN
  revoked: { 
    type: Boolean, 
    default: false 
  },
  
  // TOKEN THAY THẾ (KHI ROTATE)
  replacedBy: { 
    type: String, 
    default: null 
  }
});

// 🔹 TẠO TTL INDEX: TỰ ĐỘNG XÓA TOKEN ĐÃ HẾT HẠN
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 🔹 INDEX CHO TRUY VẤN HIỆU QUẢ
RefreshTokenSchema.index({ user: 1, revoked: 1 });
RefreshTokenSchema.index({ tokenHash: 1 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);