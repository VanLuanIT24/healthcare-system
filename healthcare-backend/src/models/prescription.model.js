// models/prescription.model.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
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
  
  // Thông tin đơn thuốc
  issueDate: {
    type: Date,
    default: Date.now
  },
  validityDays: {
    type: Number,
    default: 30
  },
  
  // Danh sách thuốc
  medications: [{
    medication: {
      name: String,
      genericName: String,
      code: String // National drug code
    },
    dosage: {
      value: Number,
      unit: String,
      form: String // tablet, capsule, injection, etc.
    },
    frequency: {
      timesPerDay: Number,
      interval: String, // every 8 hours, etc.
      instructions: String // before meals, after meals, etc.
    },
    duration: {
      value: Number,
      unit: String // days, weeks, months
    },
    route: {
      type: String,
      enum: ['ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'RECTAL', 'OTHER']
    },
    totalQuantity: Number,
    refills: {
      allowed: {
        type: Number,
        default: 0
      },
      used: {
        type: Number,
        default: 0
      }
    },
    instructions: String,
    warnings: [String],
    
    // Theo dõi
    dispenseHistory: [{
      date: Date,
      quantity: Number,
      dispensedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }]
  }],
  
  // Chỉ định và cảnh báo
  indications: [String],
  contraindications: [String],
  
  // Theo dõi điều trị
  monitoring: [{
    parameter: String, // blood pressure, glucose, etc.
    frequency: String,
    target: String
  }],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
    default: 'DRAFT'
  },
  
  // Phê duyệt và xác nhận
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
  // Ghi chú
  notes: String,
  specialInstructions: String,
  
  // Kiểm tra tương tác thuốc
  drugInteractionsChecked: {
    type: Boolean,
    default: false
  },
  interactionsFound: [{
    medication1: String,
    medication2: String,
    severity: {
      type: String,
      enum: ['MINOR', 'MODERATE', 'MAJOR']
    },
    description: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
prescriptionSchema.index({ patientId: 1, issueDate: -1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ status: 1 });

// Virtuals
prescriptionSchema.virtual('isValid').get(function() {
  if (this.status !== 'ACTIVE') return false;
  const expiryDate = new Date(this.issueDate);
  expiryDate.setDate(expiryDate.getDate() + this.validityDays);
  return new Date() <= expiryDate;
});

prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

// Methods
prescriptionSchema.methods.dispenseMedication = function(medicationIndex, quantity, dispensedBy) {
  if (medicationIndex >= this.medications.length) {
    throw new Error('Invalid medication index');
  }
  
  const medication = this.medications[medicationIndex];
  medication.dispenseHistory.push({
    date: new Date(),
    quantity,
    dispensedBy,
    notes: `Dispensed ${quantity} units`
  });
};

prescriptionSchema.methods.canRefill = function(medicationIndex) {
  if (medicationIndex >= this.medications.length) return false;
  
  const medication = this.medications[medicationIndex];
  return medication.refills.used < medication.refills.allowed;
};

// Statics
prescriptionSchema.statics.findActivePrescriptions = function(patientId) {
  return this.find({
    patientId,
    status: 'ACTIVE'
  }).populate('doctorId');
};

prescriptionSchema.statics.findByMedication = function(medicationName) {
  return this.find({
    'medications.medication.name': new RegExp(medicationName, 'i')
  });
};

module.exports = mongoose.model('Prescription', prescriptionSchema);