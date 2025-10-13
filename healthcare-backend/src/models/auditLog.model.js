// src/models/auditLog.model.js
const mongoose = require('mongoose');

/**
 * SCHEMA NHẬT KÝ KIỂM TRA (AUDIT LOG)
 * - Ghi lại tất cả hành động quan trọng trong hệ thống
 * - Phục vụ cho mục đích kiểm tra, giám sát và bảo mật
 */
const AuditLogSchema = new mongoose.Schema({
  // NGƯỜI THỰC HIỆN HÀNH ĐỘNG
  actor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // HÀNH ĐỘNG ĐƯỢC THỰC HIỆN
  action: { 
    type: String, 
    required: true,
    index: true // Index để tìm kiếm hiệu quả
  }, // Ví dụ: 'LOGIN_SUCCESS', 'CREATE_USER', 'UPDATE_PROFILE'
  
  // ĐỐI TƯỢNG BỊ TÁC ĐỘNG (nếu có)
  target: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  
  // THÔNG TIN MẠNG VÀ THIẾT BỊ
  ip: { 
    type: String,
    index: true 
  },
  userAgent: { 
    type: String 
  },
  
  // THÔNG TIN BỔ SUNG DẠNG LINH HOẠT
  meta: { 
    type: Object, 
    default: {} 
  }
}, { 
  // TỰ ĐỘNG THÊM TIMESTAMPS (createdAt, updatedAt)
  timestamps: true 
});

// 🔹 TẠO INDEX CHO TRUY VẤN HIỆU QUẢ
AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);