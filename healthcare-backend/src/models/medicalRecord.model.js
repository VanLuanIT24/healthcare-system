// models/medicalRecord.model.js
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
    weight: Number
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

// Indexes
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ recordId: 1 });
medicalRecordSchema.index({ 'diagnoses.code': 1 });

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

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);