// models/patient.model.js
const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Thông tin bệnh nhân
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']
  },
  height: Number, // cm
  weight: Number, // kg
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE']
    },
    reaction: String,
    notes: String
  }],
  chronicConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_REMISSION', 'RESOLVED']
    },
    notes: String
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  familyHistory: [{
    condition: String,
    relation: String,
    notes: String
  }],
  lifestyle: {
    smoking: {
      type: String,
      enum: ['NEVER', 'FORMER', 'CURRENT']
    },
    alcohol: {
      type: String,
      enum: ['NEVER', 'OCCASIONAL', 'REGULAR']
    },
    exercise: {
      type: String,
      enum: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE']
    },
    diet: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    effectiveDate: Date,
    expirationDate: Date
  },
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'vi'
    },
    communicationMethod: {
      type: String,
      enum: ['EMAIL', 'SMS', 'PHONE'],
      default: 'EMAIL'
    },
    privacyLevel: {
      type: String,
      enum: ['STANDARD', 'RESTRICTED'],
      default: 'STANDARD'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
patientSchema.index({ patientId: 1 });
patientSchema.index({ 'insurance.provider': 1 });
patientSchema.index({ userId: 1 });

// Virtuals
patientSchema.virtual('medicalRecords', {
  ref: 'MedicalRecord',
  localField: 'userId',
  foreignField: 'patientId'
});

patientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: 'userId',
  foreignField: 'patientId'
});

// Methods
patientSchema.methods.getBMI = function() {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

patientSchema.methods.hasAllergy = function(allergen) {
  return this.allergies.some(allergy => 
    allergy.allergen.toLowerCase().includes(allergen.toLowerCase())
  );
};

// Statics
patientSchema.statics.findByBloodType = function(bloodType) {
  return this.find({ bloodType }).populate('userId');
};

patientSchema.statics.findWithChronicCondition = function(condition) {
  return this.find({
    'chronicConditions.condition': new RegExp(condition, 'i')
  }).populate('userId');
};

module.exports = mongoose.model('Patient', patientSchema);