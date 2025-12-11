// src/models/consultation.model.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  consultationId: {
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
  
  // Thông tin tư vấn
  consultationDate: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['INITIAL', 'FOLLOW_UP', 'SURGICAL', 'SPECIALIST'],
    required: true
  },
  mode: {
    type: String,
    enum: ['IN_PERSON', 'TELEMEDICINE', 'PHONE'],
    default: 'IN_PERSON'
  },
  
  // Nội dung tư vấn
  subjective: {
    chiefComplaint: String,
    historyOfPresentIllness: String,
    reviewOfSystems: String,
    patientConcerns: String
  },
  
  objective: {
    physicalFindings: String,
    assessmentResults: String,
    observations: String
  },
  
  assessment: {
    clinicalImpressions: String,
    differentialDiagnosis: [String],
    problemList: [String]
  },
  
  plan: {
    diagnosticTests: [String],
    treatments: [String],
    medications: [String],
    referrals: [String],
    patientEducation: String,
    followUpPlan: String
  },
  
  // Kết quả và khuyến nghị
  recommendations: [{
    category: String,
    description: String,
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    },
    deadline: Date
  }],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  
  // Thời gian
  duration: Number, // minutes
  startTime: Date,
  endTime: Date,
  
  // Ghi chú và đánh giá
  notes: String,
  outcome: {
    type: String,
    enum: ['IMPROVED', 'STABLE', 'WORSE', 'REFERRED']
  },
  
  // Document references
  attachedDocuments: [{
    name: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ FIX: Compound indexes chỉ
consultationSchema.index({ patientId: 1, consultationDate: -1 });
consultationSchema.index({ doctorId: 1, consultationDate: -1 });
consultationSchema.index({ medicalRecordId: 1 });
consultationSchema.index({ status: 1 });

// Virtuals
consultationSchema.virtual('prescriptions', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'consultationId'
});

// Methods
consultationSchema.methods.isOverdue = function() {
  return this.status === 'SCHEDULED' && this.startTime < new Date();
};

consultationSchema.methods.getDurationInMinutes = function() {
  if (!this.startTime || !this.endTime) return null;
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
};

// Statics
consultationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId doctorId');
};

consultationSchema.statics.findCompletedConsultations = function(startDate, endDate) {
  return this.find({
    status: 'COMPLETED',
    consultationDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('Consultation', consultationSchema);