// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  // Thông tin đăng nhập
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    default: ROLES.PATIENT
  },

  // Trạng thái tài khoản
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'LOCKED', 'DELETED'],
    default: 'ACTIVE'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Bảo mật
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Thông tin cá nhân
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    profilePicture: String
  },

  // Thông tin chuyên môn
  professionalInfo: {
    licenseNumber: String,
    specialization: String,
    department: String,
    qualifications: [String],
    yearsOfExperience: Number,
    hireDate: Date,
    position: String
  },

  // Các chuyên khoa khác (dành cho bác sĩ)
  specialties: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String
  }],

  // Chứng chỉ/Bằng cấp (dành cho bác sĩ)
  certificates: [{
    name: String,
    year: String,
    issuer: String,
    id: mongoose.Schema.Types.ObjectId
  }],

  // Documents
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }],

  // Settings
  settings: {
    language: {
      type: String,
      default: 'vi'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      default: 'light'
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    }
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: Date,
  deletionReason: String,
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  restoredAt: Date

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
userSchema.index({ role: 1, status: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ 'personalInfo.phone': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'professionalInfo.department': 1 });
userSchema.index({ 'professionalInfo.specialization': 1 });

// 🔍 THÊM TEXT INDEX CHO TÌM KIẾM NHANH (dùng trong searchUsers)
userSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  email: 'text'
}, {
  weights: {
    'personalInfo.firstName': 10,
    'personalInfo.lastName': 10,
    email: 5
  },
  name: 'user_text_search_index'
});

// ==================== VIRTUALS ====================
userSchema.virtual('fullName').get(function () {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`.trim();
});

userSchema.virtual('age').get(function () {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('isAccountLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('profilePictureUrl').get(function () {
  if (!this.personalInfo.profilePicture) return null;
  // Use backend URL (port 5000) for serving static files
  return `${process.env.APP_URL || 'http://localhost:5000'}/uploads/profiles/${this.personalInfo.profilePicture}`;
});

// ==================== METHODS ====================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000,
      status: 'LOCKED'
    };
  }
  return this.updateOne(updates);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return this.emailVerificationToken;
};

userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000;
  return this.resetPasswordToken;
};

userSchema.methods.verifyEmail = function () {
  this.isEmailVerified = true;
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
};

userSchema.methods.softDelete = function (deletedBy, reason = '') {
  this.isDeleted = true;
  this.status = 'DELETED';
  this.isActive = false;
  this.deletedBy = deletedBy;
  this.deletedAt = new Date();
  this.deletionReason = reason;
  this.email = `deleted_${Date.now()}_${this.email}`;
};

userSchema.methods.restore = function (restoredBy) {
  const originalEmail = this.email.replace(/^deleted_\d+_/, '');
  this.email = originalEmail;
  this.isDeleted = false;
  this.status = 'ACTIVE';
  this.isActive = true;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.deletionReason = undefined;
  this.restoredBy = restoredBy;
  this.restoredAt = new Date();
};

userSchema.methods.updateProfilePicture = function (filename) {
  this.personalInfo.profilePicture = filename;
};

// ==================== STATICS ====================
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

userSchema.statics.findByVerificationToken = function (token) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
    isDeleted: false
  });
};

userSchema.statics.findByResetToken = function (token) {
  return this.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
    isDeleted: false
  });
};

userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$role',
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        verified: { $sum: { $cond: ['$isEmailVerified', 1, 0] } }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const totalUsers = await this.countDocuments({ isDeleted: false });
  const activeUsers = await this.countDocuments({ status: 'ACTIVE', isDeleted: false });
  const verifiedUsers = await this.countDocuments({ isEmailVerified: true, isDeleted: false });

  return {
    byRole: stats,
    summary: {
      totalUsers,
      activeUsers,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : '0'
    }
  };
};

// ==================== MIDDLEWARE ====================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.isActive = this.status === 'ACTIVE';
  }
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.post('save', function (doc) {
  console.log(`✅ User saved: ${doc.email} (${doc.role})`);
});

userSchema.post('findOneAndUpdate', function (doc) {
  if (doc) console.log(`✅ User updated: ${doc.email}`);
});

module.exports = mongoose.model('User', userSchema);