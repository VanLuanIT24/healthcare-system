const mongoose = require('mongoose');

/**
 * 🛡️ MODEL AUDIT LOG CHO HEALTHCARE SYSTEM
 * - Lưu trữ tất cả hoạt động quan trọng trong hệ thống
 * - Tuân thủ HIPAA và các quy định lưu trữ dữ liệu y tế
 */

const auditLogSchema = new mongoose.Schema({
  // ========== THÔNG TIN NGƯỜI DÙNG ==========
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  userRole: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: String,
  userName: String,

  // ========== THÔNG TIN HÀNH ĐỘNG ==========
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },

  // ========== THÔNG TIN REQUEST ==========
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: String,
  httpMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  endpoint: String,

  // ========== DỮ LIỆU THAY ĐỔI ==========
  oldData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  }],

  // ========== THÔNG TIN RESPONSE ==========
  statusCode: Number,
  responseTime: Number, // milliseconds
  success: {
    type: Boolean,
    default: true,
  },
  errorMessage: String,

  // ========== BẢO MẬT & PHÂN LOẠI ==========
  category: {
    type: String,
    enum: [
      'AUTHENTICATION', 
      'DATA_ACCESS', 
      'DATA_MODIFICATION', 
      'USER_MANAGEMENT', 
      'MEDICAL_RECORDS',
      'PRESCRIPTION',
      'BILLING',
      'APPOINTMENT',
      'OTHER'
    ],
    default: 'OTHER',
    index: true,
  },

  // ========== THÔNG TIN BỆNH NHÂN (CHO HIPAA) ==========
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  // ========== TIMESTAMP ==========
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
}, {
  timestamps: true,
});

// ========== INDEXES CƠ BẢN ==========
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ patientId: 1, timestamp: -1 });

// ========== VIRTUAL FIELDS ==========
auditLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
});

// ========== INSTANCE METHODS ==========
auditLogSchema.methods.markAsFailure = function(errorMessage) {
  this.success = false;
  this.errorMessage = errorMessage;
};

auditLogSchema.methods.calculateChanges = function() {
  if (!this.oldData || !this.newData) {
    this.changes = [];
    return;
  }

  const changes = [];
  const allKeys = new Set([
    ...Object.keys(this.oldData || {}),
    ...Object.keys(this.newData || {})
  ]);

  for (const key of allKeys) {
    const oldValue = this.oldData[key];
    const newValue = this.newData[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
      });
    }
  }

  this.changes = changes;
};

// ========== STATIC METHODS ==========
auditLogSchema.statics = {
  /**
   * TẠO AUDIT LOG MỚI
   */
  async logAction(logData) {
    try {
      const auditLog = new this(logData);
      
      // Tự động tính toán changes nếu có oldData và newData
      if (logData.oldData && logData.newData) {
        auditLog.calculateChanges();
      }
      
      return await auditLog.save();
    } catch (error) {
      console.error('❌ Lỗi tạo audit log:', error);
      return null;
    }
  },

  /**
   * TÌM KIẾM AUDIT LOG
   */
  async findLogs(filters = {}) {
    const {
      page = 1,
      limit = 50,
      sort = '-timestamp',
      startDate,
      endDate,
      actions = [],
      userIds = [],
      roles = [],
      resources = [],
    } = filters;
    
    const query = {};
    
    // FILTER THEO THỜI GIAN
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // FILTER THEO ACTION
    if (actions.length > 0) {
      query.action = { $in: actions };
    }
    
    // FILTER THEO USER
    if (userIds.length > 0) {
      query.userId = { $in: userIds };
    }
    
    // FILTER THEO ROLE
    if (roles.length > 0) {
      query.userRole = { $in: roles };
    }
    
    // FILTER THEO RESOURCE
    if (resources.length > 0) {
      query.resource = { $in: resources };
    }
    
    const skip = (page - 1) * limit;
    
    const logs = await this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email personalInfo')
      .populate('patientId', 'email personalInfo')
      .lean();
    
    const total = await this.countDocuments(query);
    
    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * THỐNG KÊ AUDIT LOG
   */
  async getStats(timeRange = '7d') {
    const now = new Date();
    let startDate = new Date();
    
    // TÍNH THỜI GIAN BẮT ĐẦU
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // THỐNG KÊ THEO ACTION
    const actionStats = await this.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    
    // THỐNG KÊ THEO USER ROLE
    const roleStats = await this.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$userRole',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    
    return {
      timeRange,
      startDate,
      endDate: now,
      totalLogs: await this.countDocuments({ timestamp: { $gte: startDate } }),
      actionStats,
      roleStats,
    };
  },

  /**
   * TÌM KIẾM TRUY CẬP DỮ LIỆU BỆNH NHÂN
   */
  async findPatientDataAccess(patientId, options = {}) {
    const { limit = 100, page = 1 } = options;
    
    const query = {
      $or: [
        { patientId: patientId },
        { resource: 'Patient', resourceId: patientId },
        { resource: 'MedicalRecord', resourceId: patientId },
      ],
    };
    
    const skip = (page - 1) * limit;
    
    const logs = await this.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email personalInfo role')
      .lean();
    
    const total = await this.countDocuments(query);
    
    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
};

// ========== MIDDLEWARE ==========
auditLogSchema.pre('save', function(next) {
  // Tự động tính toán changes trước khi save
  if (this.isModified('oldData') || this.isModified('newData')) {
    this.calculateChanges();
  }
  
  // Tự động set category nếu chưa có
  if (!this.category) {
    this.category = this.determineCategory();
  }
  
  next();
});

auditLogSchema.methods.determineCategory = function() {
  const medicalResources = ['Patient', 'MedicalRecord', 'Consultation', 'Diagnosis', 'Prescription', 'LabOrder'];
  const authActions = ['LOGIN', 'LOGOUT', 'REGISTER', 'FORGOT_PASSWORD'];
  
  if (medicalResources.includes(this.resource)) {
    return 'MEDICAL_RECORDS';
  }
  
  if (authActions.includes(this.action)) {
    return 'AUTHENTICATION';
  }
  
  if (this.resource === 'User') {
    return 'USER_MANAGEMENT';
  }
  
  if (this.resource === 'Bill') {
    return 'BILLING';
  }
  
  if (this.resource === 'Appointment') {
    return 'APPOINTMENT';
  }
  
  return 'OTHER';
};

// ========== TTL INDEX TỰ ĐỘNG XÓA LOG CŨ ==========
const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 90;
auditLogSchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: retentionDays * 24 * 60 * 60,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);