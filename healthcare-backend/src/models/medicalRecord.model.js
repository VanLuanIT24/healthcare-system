const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  
  // Thông tin lâm sàng
  visitType: {
    type: String,
    enum: ['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'FOLLOW_UP'],
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  historyOfPresentIllness: String,
  
  // Triệu chứng và dấu hiệu
  symptoms: [{
    symptom: String,
    duration: String,
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE']
    },
    notes: String
  }],
  
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    height: Number,
    weight: Number,
    recordedAt: Date,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Khám thực thể
  physicalExamination: {
    generalAppearance: String,
    cardiovascular: String,
    respiratory: String,
    abdominal: String,
    neurological: String,
    musculoskeletal: String,
    skin: String,
    findings: String,
    observations: String,
    notes: String
  },
  
  // Chẩn đoán
  diagnoses: [{
    diagnosis: String,
    code: String, // ICD-10 code
    type: {
      type: String,
      enum: ['PRIMARY', 'SECONDARY', 'DIFFERENTIAL']
    },
    certainty: {
      type: String,
      enum: ['CONFIRMED', 'PROBABLE', 'POSSIBLE']
    },
    notes: String
  }],
  
  // Kế hoạch điều trị
  treatmentPlan: {
    recommendations: String,
    followUp: {
      required: Boolean,
      date: Date,
      notes: String
    },
    referrals: [{
      department: String,
      reason: String,
      urgency: {
        type: String,
        enum: ['ROUTINE', 'URGENT', 'EMERGENCY']
      }
    }],
    medicalHistory: [{
      category: {
        type: String,
        enum: ['CHRONIC_CONDITION', 'SURGERY', 'ALLERGY', 'MEDICATION', 'FAMILY_HISTORY', 'OTHER']
      },
      condition: String,
      description: String,
      onsetDate: Date,
      status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'CHRONIC']
      },
      severity: {
        type: String,
        enum: ['MILD', 'MODERATE', 'SEVERE']
      },
      treatment: String,
      notes: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Trạng thái hồ sơ
  status: {
    type: String,
    enum: ['DRAFT', 'COMPLETED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  
  // Bảo mật và quyền riêng tư
  privacyLevel: {
    type: String,
    enum: ['STANDARD', 'SENSITIVE', 'RESTRICTED'],
    default: 'STANDARD'
  },
  
  // Thời gian điều trị
  duration: Number, // minutes
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ FIX: Compound indexes chỉ - loại bỏ recordId index trùng (unique đã có)
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });
medicalRecordSchema.index({ 'diagnoses.code': 1 });
medicalRecordSchema.index({ status: 1, department: 1 });
medicalRecordSchema.index({ visitType: 1 });

// Virtuals
medicalRecordSchema.virtual('consultations', {
  ref: 'Consultation',
  localField: '_id',
  foreignField: 'medicalRecordId'
});

medicalRecordSchema.virtual('prescriptions', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'medicalRecordId'
});

medicalRecordSchema.virtual('labOrders', {
  ref: 'LabOrder',
  localField: '_id',
  foreignField: 'medicalRecordId'
});

// Methods
medicalRecordSchema.methods.calculateBMI = function() {
  if (!this.vitalSigns.height || !this.vitalSigns.weight) return null;
  const heightInMeters = this.vitalSigns.height / 100;
  return (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

medicalRecordSchema.methods.hasDiagnosis = function(diagnosisCode) {
  return this.diagnoses.some(d => d.code === diagnosisCode);
};

medicalRecordSchema.methods.getRecentVitalSigns = function() {
  if (!this.vitalSigns) return null;
  return {
    bloodPressure: this.vitalSigns.bloodPressure,
    heartRate: this.vitalSigns.heartRate,
    respiratoryRate: this.vitalSigns.respiratoryRate,
    temperature: this.vitalSigns.temperature,
    recordedAt: this.vitalSigns.recordedAt || this.updatedAt
  };
};

medicalRecordSchema.methods.hasActiveDiagnosis = function() {
  return this.diagnoses && this.diagnoses.some(d => 
    d.certainty === 'CONFIRMED'
  );
};

medicalRecordSchema.methods.getActiveMedications = function() {
  if (!this.treatmentPlan || !this.treatmentPlan.medicalHistory) return [];
  return this.treatmentPlan.medicalHistory.filter(history =>
    history.category === 'MEDICATION' && history.status === 'ACTIVE'
  );
};

// Statics
medicalRecordSchema.statics.findByDiagnosis = function(diagnosisCode) {
  return this.find({ 'diagnoses.code': diagnosisCode });
};

medicalRecordSchema.statics.findByPatientAndDateRange = function(patientId, startDate, endDate) {
  return this.find({
    patientId,
    visitDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ visitDate: -1 });
};

medicalRecordSchema.statics.getDepartmentStats = async function(department, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        department,
        visitDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$visitType',
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
        },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);

  return stats;
};

medicalRecordSchema.statics.getPatientMedicalHistory = async function(patientId) {
  const records = await this.find({ patientId })
    .select('visitDate visitType chiefComplaint diagnoses treatmentPlan.medicalHistory')
    .sort({ visitDate: -1 })
    .populate('doctorId', 'personalInfo.name specialization');

  return records;
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);