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
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: {
      value: Number,
      unit: String,
      form: String
    },
    frequency: {
      timesPerDay: Number,
      interval: String,
      instructions: String
    },
    duration: {
      value: Number,
      unit: String
    },
    route: {
      type: String,
      enum: ['ORAL', 'TOPICAL', 'INJECTION', 'INHALATION', 'RECTAL', 'OTHER']
    },
    totalQuantity: {
      type: Number,
      required: true
    },
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
    coverageStatus: {
      type: String,
      enum: ['COVERED', 'PARTIAL', 'NOT_COVERED', 'PENDING'],
      default: 'PENDING'
    },
    insuranceCoverage: {
      coveredAmount: Number,
      patientCost: Number
    }
  }],
  
  // Phát thuốc
  dispenseHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    quantity: Number,
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    batchNumber: String,
    expiryDate: Date,
    notes: String
  }],
  
  // Quản lý trạng thái
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'DISPENSED', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
    default: 'DRAFT'
  },
  
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
    description: String,
    recommendation: String
  }],
  
  // Phê duyệt
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
  // Ghi chú
  notes: String,
  specialInstructions: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
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
prescriptionSchema.index({ 'medications.medicationId': 1 });

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

prescriptionSchema.virtual('dispensedMedications').get(function() {
  return this.dispenseHistory.length;
});

// Methods
prescriptionSchema.methods.dispenseMedication = function(medicationId, quantity, dispensedBy, batchInfo = {}) {
  const medication = this.medications.id(medicationId);
  if (!medication) {
    throw new Error('Medication not found in prescription');
  }

  const totalDispensed = this.dispenseHistory
    .filter(d => d.medicationId.toString() === medicationId.toString())
    .reduce((sum, d) => sum + d.quantity, 0);

  if (totalDispensed + quantity > medication.totalQuantity) {
    throw new Error('Dispense quantity exceeds prescribed amount');
  }

  this.dispenseHistory.push({
    medicationId,
    quantity,
    dispensedBy,
    ...batchInfo
  });

  // Update status if all medications are dispensed
  const totalPrescribed = this.medications.reduce((sum, med) => sum + med.totalQuantity, 0);
  const totalDispensedAll = this.dispenseHistory.reduce((sum, d) => sum + d.quantity, 0);
  
  if (totalDispensedAll >= totalPrescribed) {
    this.status = 'DISPENSED';
  }
};

prescriptionSchema.methods.canRefill = function(medicationId) {
  const medication = this.medications.id(medicationId);
  if (!medication) return false;
  
  return medication.refills.used < medication.refills.allowed;
};

prescriptionSchema.methods.refillMedication = function(medicationId, quantity) {
  if (!this.canRefill(medicationId)) {
    throw new Error('No refills available for this medication');
  }

  const medication = this.medications.id(medicationId);
  medication.refills.used += 1;
  
  // Add to original total quantity for dispensing
  medication.totalQuantity += quantity;
};

// Statics
prescriptionSchema.statics.findActivePrescriptions = function(patientId) {
  return this.find({
    patientId,
    status: 'ACTIVE'
  }).populate('doctorId medications.medicationId');
};

prescriptionSchema.statics.findByMedication = function(medicationName) {
  return this.find({
    'medications.name': new RegExp(medicationName, 'i')
  });
};

prescriptionSchema.statics.getPharmacyOrders = function(status) {
  const query = {};
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('patientId', 'personalInfo')
    .populate('doctorId', 'personalInfo')
    .populate('medications.medicationId')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Prescription', prescriptionSchema);