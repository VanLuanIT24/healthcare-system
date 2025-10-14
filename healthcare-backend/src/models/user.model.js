// src/models/user.model.js
const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

/**
 * Schema 2FA
 */
const TwoFASchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  secret: { type: String, default: null },
});

/**
 * Schema User với RBAC integration
 */
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    index: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  
  name: { 
    type: String, 
    required: true 
  },
  
  passwordHash: { 
    type: String, 
    required: true 
  },
  
  role: { 
    type: String, 
    enum: Object.values(ROLES),
    required: true, 
    default: ROLES.PATIENT,
    index: true
  },
  
  canCreate: { 
    type: [String], 
    enum: Object.values(ROLES),
    default: [] 
  },
  
  status: { 
    type: String, 
    enum: ['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'DEACTIVATED'], 
    default: 'PENDING_VERIFICATION',
    index: true
  },
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  
  failedLoginAttempts: { 
    type: Number, 
    default: 0 
  },
  
  lockUntil: { 
    type: Date, 
    default: null 
  },
  
  twoFA: { 
    type: TwoFASchema, 
    default: () => ({}) 
  },
  
  lastLogin: {
    ip: String,
    userAgent: String,
    at: Date
  },
  
  profile: {
    phone: String,
    address: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] }
  }
}, { 
  timestamps: true 
});

/**
 * Virtual: Kiểm tra tài khoản bị khóa
 */
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Method: Kiểm tra quyền của user
 */
UserSchema.methods.hasPermission = function(permission) {
  const { hasPermission } = require('../constants/roles');
  return hasPermission(this.role, permission);
};

/**
 * Method: Kiểm tra có thể tạo role nào
 */
UserSchema.methods.canCreateRole = function(targetRole) {
  const { canCreateRole } = require('../constants/roles');
  return canCreateRole(this.role, targetRole);
};

/**
 * Pre-save middleware: Tự động tính toán canCreate dựa trên role
 */
UserSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  // Tự động tính toán canCreate dựa trên role hierarchy
  if (this.isModified('role')) {
    this.canCreate = calculateCreatableRoles(this.role);
  }

  next();
});

/**
 * Hàm tính toán các role mà user có thể tạo
 */
function calculateCreatableRoles(role) {
  const { ROLES, canCreateRole } = require('../constants/roles');
  const creatable = [];
  
  Object.values(ROLES).forEach(targetRole => {
    if (canCreateRole(role, targetRole)) {
      creatable.push(targetRole);
    }
  });
  
  return creatable;
}

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'profile.phone': 1 });

module.exports = mongoose.model('User', UserSchema);