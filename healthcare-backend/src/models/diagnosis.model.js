// models/diagnosis.model.js
const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  diagnosisId: {
    type: String,
    unique: true,
    required: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
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
  
  // Thông tin chẩn đoán
  diagnosisCode: {
    type: String,
    required: true // ICD-10 code
  },
  diagnosisName: {
    type: String,
    required: true
  },
  category: String,
  
  // Phân loại
  type: {
    type: String,
    enum: ['PRIMARY', 'SECONDARY', 'DIFFERENTIAL', 'PROVISIONAL'],
    default: 'PRIMARY'
  },
  certainty: {
    type: String,
    enum: ['CONFIRMED', 'PROBABLE', 'POSSIBLE', 'RULED_OUT'],
    default: 'PROBABLE'
  },
  severity: {
    type: String,
    enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL']
  },
  
  // Thời gian
  onsetDate: Date,
  diagnosedDate: {
    type: Date,
    default: Date.now
  },
  resolvedDate: Date,
  
  // Mô tả chi tiết
  description: String,
  clinicalFeatures: [String],
  diagnosticCriteria: [String],
  
  // Các yếu tố liên quan
  riskFactors: [{
    factor: String,
    category: String,
    notes: String
  }],
  
  complications: [{
    complication: String,
    onsetDate: Date,
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'CHRONIC']
    },
    treatment: String
  }],
  
  // Điều trị và theo dõi
  treatmentStatus: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DISCONTINUED']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpInterval: String, // e.g., "2 weeks", "1 month"
  
  // Ghi chú và đánh giá
  notes: String,
  prognosis: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'GUARDED']
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['ACTIVE', 'IN_REMISSION', 'RESOLVED', 'CHRONIC'],
    default: 'ACTIVE'
  },
  
  // Xác nhận
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmationDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
diagnosisSchema.index({ patientId: 1, diagnosedDate: -1 });
diagnosisSchema.index({ diagnosisCode: 1 });
diagnosisSchema.index({ doctorId: 1 });
diagnosisSchema.index({ status: 1 });

// Virtuals
diagnosisSchema.virtual('isActive').get(function() {
  return this.status === 'ACTIVE';
});

diagnosisSchema.virtual('duration').get(function() {
  if (!this.onsetDate) return null;
  const start = this.onsetDate;
  const end = this.resolvedDate || new Date();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)); // days
});

// Methods
diagnosisSchema.methods.markAsResolved = function() {
  this.status = 'RESOLVED';
  this.resolvedDate = new Date();
};

diagnosisSchema.methods.addComplication = function(complication, onsetDate = new Date()) {
  this.complications.push({
    complication,
    onsetDate,
    status: 'ACTIVE'
  });
};

// Statics
diagnosisSchema.statics.findByICDCode = function(code) {
  return this.find({ diagnosisCode: code });
};

diagnosisSchema.statics.findActiveDiagnoses = function(patientId) {
  return this.find({
    patientId,
    status: 'ACTIVE'
  }).populate('doctorId');
};

diagnosisSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId doctorId');
};

module.exports = mongoose.model('Diagnosis', diagnosisSchema);