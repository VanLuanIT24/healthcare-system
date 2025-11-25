const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  patientId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    uppercase: true,
    trim: true
  },

  // 🩺 THÔNG TIN Y TẾ CƠ BẢN
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  height: {
    type: Number, // cm
    min: [30, 'Chiều cao tối thiểu là 30cm'],
    max: [250, 'Chiều cao tối đa là 250cm']
  },
  weight: {
    type: Number, // kg
    min: [2, 'Cân nặng tối thiểu là 2kg'],
    max: [300, 'Cân nặng tối đa là 300kg']
  },
  
  // 🚨 THÔNG TIN KHẨN CẤP
  emergencyInfo: {
    contactName: {
      type: String,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    contactRelationship: {
      type: String,
      enum: ['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'FRIEND', 'OTHER']
    },
    knownAllergies: [String],
    currentMedications: [String],
    primaryPhysician: {
      type: String, // Cho phép cả string và ObjectId
      trim: true
    },
    insuranceProvider: String
  },

  // 🤧 DỊ ỨNG
  allergies: [{
    allergen: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'],
      required: true
    },
    reaction: {
      type: String,
      required: true
    },
    onsetDate: Date,
    treatment: String,
    notes: String,
    isActive: {
      type: Boolean,
      default: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedDate: {
      type: Date,
      default: Date.now
    }
  }],

  // 🏥 BỆNH MÃN TÍNH
  chronicConditions: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    icd10Code: String,
    diagnosedDate: {
      type: Date,
      required: true
    },
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_REMISSION', 'RESOLVED', 'MONITORING'],
      default: 'ACTIVE'
    },
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE']
    },
    treatmentPlan: String,
    notes: String,
    lastReviewed: Date
  }],

  // 💊 THUỐC HIỆN TẠI
  currentMedications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    route: {
      type: String,
      enum: ['ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'OTHER']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purpose: String,
    instructions: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // 👨‍👩‍👧‍👦 TIỀN SỬ GIA ĐÌNH
  familyHistory: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true,
      enum: ['MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'OTHER']
    },
    ageAtDiagnosis: Number,
    notes: String,
    isGenetic: {
      type: Boolean,
      default: false
    },
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE']
    }
  }],

  // 🏃 LỐI SỐNG - CORRECTED SCHEMA
  lifestyle: {
    smoking: {
      status: {
        type: String,
        enum: ['NEVER', 'FORMER', 'CURRENT'],
        default: 'NEVER'
      },
      years: Number,
      packsPerDay: Number,
      quitDate: Date
    },
    alcohol: {
      status: {
        type: String,
        enum: ['NEVER', 'OCCASIONAL', 'REGULAR', 'HEAVY'],
        default: 'NEVER'
      },
      drinksPerWeek: Number,
      drinkType: String  // RENAMED from 'type' to avoid conflict
    },
    exercise: {
      frequency: {
        type: String,
        enum: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'],
        default: 'SEDENTARY'
      },
      exerciseType: String,  // RENAMED from 'type' to avoid conflict
      hoursPerWeek: Number
    },
    diet: {
      type: String,
      enum: ['OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'GLUTEN_FREE', 'OTHER', 'MEDITERRANEAN'],
      default: 'OMNIVORE'
    },
    sleepHours: Number,
    stressLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH']
    }
  },

  // 🛡️ BẢO HIỂM
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    groupNumber: String,
    effectiveDate: Date,
    expirationDate: Date,
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  },

  // 📋 THÔNG TIN NHẬP/XUẤT VIỆN
  admissionStatus: {
    type: String,
    enum: ['ADMITTED', 'DISCHARGED', 'TRANSFERRED'],
    default: 'DISCHARGED'
  },
  
  currentAdmission: {
    admissionDate: Date,
    department: String,
    room: String,
    bed: String,
    diagnosis: String,
    attendingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },

  admissionHistory: [{
    admissionDate: Date,
    dischargeDate: Date,
    department: String,
    room: String,
    bed: String,
    diagnosis: String,
    attendingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dischargeReason: String,
    condition: {
      type: String,
      enum: ['RECOVERED', 'IMPROVED', 'UNCHANGED', 'WORSE', 'DECEASED']
    },
    followUpInstructions: String,
    medicationsAtDischarge: [String],
    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // ⚙️ TÙY CHỌN
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'vi',
      enum: ['vi', 'en']
    },
    communicationMethod: {
      type: String,
      enum: ['EMAIL', 'SMS', 'PHONE', 'APP_NOTIFICATION'],
      default: 'EMAIL'
    },
    privacyLevel: {
      type: String,
      enum: ['STANDARD', 'RESTRICTED', 'HIGHLY_RESTRICTED'],
      default: 'STANDARD'
    },
    allowResearch: {
      type: Boolean,
      default: false
    },
    emergencyContactPriority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    }
  },

  // 🏷️ PHÂN LOẠI
  tags: [String],
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },

  // 📝 GHI CHÚ ĐẶC BIỆT
  specialNotes: [{
    note: String,
    category: {
      type: String,
      enum: ['BEHAVIORAL', 'MEDICAL', 'ADMINISTRATIVE', 'OTHER']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // 👤 THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 INDEXES TỐI ƯU
patientSchema.index({ patientId: 1 });
patientSchema.index({ userId: 1 });
patientSchema.index({ 'insurance.provider': 1 });
patientSchema.index({ admissionStatus: 1 });
patientSchema.index({ 'allergies.allergen': 1 });
patientSchema.index({ 'chronicConditions.condition': 1 });
patientSchema.index({ riskLevel: 1 });
patientSchema.index({ createdAt: 1 });
patientSchema.index({ 'emergencyInfo.contactPhone': 1 });

// 🔮 VIRTUAL FIELDS
patientSchema.virtual('fullName').get(function() {
  if (this.userId && this.userId.personalInfo) {
    return `${this.userId.personalInfo.firstName} ${this.userId.personalInfo.lastName}`;
  }
  return 'N/A';
});

patientSchema.virtual('age').get(function() {
  if (this.userId && this.userId.personalInfo && this.userId.personalInfo.dateOfBirth) {
    const birthDate = new Date(this.userId.personalInfo.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// 📊 METHODS
patientSchema.methods.getBMI = function() {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

patientSchema.methods.getBMICategory = function() {
  const bmi = this.getBMI();
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi < 25) return 'NORMAL';
  if (bmi < 30) return 'OVERWEIGHT';
  return 'OBESE';
};

patientSchema.methods.hasAllergy = function(allergen) {
  return this.allergies.some(allergy => 
    allergy.isActive && 
    allergy.allergen.toLowerCase().includes(allergen.toLowerCase())
  );
};

patientSchema.methods.getActiveMedications = function() {
  return this.currentMedications.filter(med => med.isActive);
};

patientSchema.methods.getActiveConditions = function() {
  return this.chronicConditions.filter(condition => 
    condition.status === 'ACTIVE' || condition.status === 'MONITORING'
  );
};

patientSchema.methods.calculateRiskLevel = function() {
  let riskScore = 0;
  
  // Điểm từ bệnh mãn tính
  const severeConditions = this.chronicConditions.filter(c => 
    c.severity === 'SEVERE' && (c.status === 'ACTIVE' || c.status === 'MONITORING')
  );
  riskScore += severeConditions.length * 3;
  
  // Điểm từ dị ứng nghiêm trọng
  const severeAllergies = this.allergies.filter(a => 
    a.isActive && a.severity === 'LIFE_THREATENING'
  );
  riskScore += severeAllergies.length * 4;
  
  // Điểm từ tuổi
  const age = this.age;
  if (age > 65) riskScore += 2;
  if (age > 75) riskScore += 3;
  
  // Đánh giá mức độ rủi ro
  if (riskScore >= 8) return 'CRITICAL';
  if (riskScore >= 5) return 'HIGH';
  if (riskScore >= 3) return 'MEDIUM';
  return 'LOW';
};

patientSchema.methods.isCurrentlyAdmitted = function() {
  return this.admissionStatus === 'ADMITTED';
};

patientSchema.methods.getEmergencyContacts = function() {
  const contacts = [];
  
  if (this.emergencyInfo.contactName && this.emergencyInfo.contactPhone) {
    contacts.push({
      name: this.emergencyInfo.contactName,
      phone: this.emergencyInfo.contactPhone,
      relationship: this.emergencyInfo.contactRelationship,
      priority: this.preferences.emergencyContactPriority
    });
  }
  
  return contacts;
};

// 📈 STATIC METHODS
patientSchema.statics.findByBloodType = function(bloodType) {
  return this.find({ bloodType })
    .populate('userId', 'personalInfo email phone dateOfBirth gender address')
    .populate('emergencyInfo.primaryPhysician', 'personalInfo');
};

patientSchema.statics.findWithChronicCondition = function(condition) {
  return this.find({
    'chronicConditions.condition': new RegExp(condition, 'i'),
    'chronicConditions.status': { $in: ['ACTIVE', 'MONITORING'] }
  }).populate('userId', 'personalInfo email phone dateOfBirth gender address');
};

patientSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({ riskLevel })
    .populate('userId', 'personalInfo email phone dateOfBirth gender address')
    .sort({ createdAt: -1 });
};

// 🔄 PRE-SAVE MIDDLEWARE
patientSchema.pre('save', function(next) {
  // Tự động tính riskLevel trước khi lưu
  if (this.isModified('chronicConditions') || this.isModified('allergies') || this.isModified('userId')) {
    this.riskLevel = this.calculateRiskLevel();
  }
  
  next();
});

// 📋 POST-SAVE MIDDLEWARE
patientSchema.post('save', function(doc) {
  console.log(`✅ Patient profile saved/updated: ${doc.patientId} (Risk: ${doc.riskLevel})`);
});

module.exports = mongoose.model('Patient', patientSchema);