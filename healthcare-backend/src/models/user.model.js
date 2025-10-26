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
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    default: ROLES.PATIENT
  },
  
  // ✅ THÊM TRƯỜNG STATUS (QUAN TRỌNG)
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'LOCKED'],
    default: 'ACTIVE'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },

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
    }
  },

  // Thông tin chuyên môn (cho nhân viên y tế)
  professionalInfo: {
    licenseNumber: String,
    specialization: String,
    department: String,
    qualifications: [String],
    yearsOfExperience: Number,
    hireDate: Date
  },

  // Avatar và documents
  avatar: String,
  documents: [{
    name: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Settings và preferences
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
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 }); // ✅ THÊM INDEX CHO STATUS
userSchema.index({ 'personalInfo.phone': 1 });
userSchema.index({ createdAt: 1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

userSchema.virtual('age').get(function() {
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

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function() {
  // Nếu lock đã hết hạn, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Tăng số lần thử
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Khóa tài khoản sau 5 lần thất bại trong 2 giờ
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { 
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      status: 'LOCKED' // ✅ CẬP NHẬT STATUS KHI KHÓA
    };
  }
  
  return this.updateOne(updates);
};

// Statics
userSchema.statics.getRoles = function() {
  return ROLES;
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, status: 'ACTIVE' }); // ✅ CHỈ TÌM USER ACTIVE
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ status: 'ACTIVE' });
};

// Pre-save middleware - SỬA LẠI HOÀN TOÀN
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được modified VÀ chưa được hash
  if (!this.isModified('password')) return next();
  
  console.log('🔐 [USER MODEL] Hashing password...');
  console.log('🔐 [USER MODEL] Original password:', this.password ? `${this.password.substring(0, 10)}...` : 'NULL');
  
  try {
    // Kiểm tra xem password đã được hash chưa
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      console.log('⚠️ [USER MODEL] Password already hashed, skipping...');
      return next();
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ [USER MODEL] Password hashed successfully');
    console.log('✅ [USER MODEL] Hashed password:', this.password.substring(0, 30) + '...');
    next();
  } catch (error) {
    console.error('❌ [USER MODEL] Password hashing error:', error);
    next(error);
  }
});

// ✅ MIDDLEWARE ĐẢM BẢO STATUS VÀ isActive ĐỒNG BỘ
userSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.isActive = this.status === 'ACTIVE';
  }
  next();
});

module.exports = mongoose.model('User', userSchema);