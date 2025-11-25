const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
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
  
  // Thông tin chỉ định
  orderDate: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['ROUTINE', 'URGENT', 'STAT'],
    default: 'ROUTINE'
  },
  department: String,
  
  // Danh sách xét nghiệm
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    testCode: String,
    testName: {
      type: String,
      required: true
    },
    category: String,
    specimenType: {
      type: String,
      enum: ['BLOOD', 'URINE', 'STOOL', 'TISSUE', 'SALIVA', 'CSF', 'OTHER']
    },
    specimenRequirements: String,
    instructions: String,
    price: Number,
    
    // Kết quả
    result: {
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      normalRange: String,
      flag: {
        type: String,
        enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL', 'ABNORMAL']
      },
      notes: String,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date
    },
    
    // Trạng thái
    status: {
      type: String,
      enum: ['ORDERED', 'COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'ORDERED'
    },
    
    // Thời gian
    collectionDate: Date,
    receivedDate: Date,
    startedDate: Date,
    completedDate: Date,
    
    // Người thực hiện
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // File đính kèm
    attachedFiles: [{
      name: String,
      fileUrl: String,
      uploadDate: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  
  // Chỉ định lâm sàng
  clinicalIndication: String,
  differentialDiagnosis: [String],
  preTestConditions: String,
  
  // Trạng thái tổng
  status: {
    type: String,
    enum: ['DRAFT', 'ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  // Phê duyệt
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
  // Ghi chú
  notes: String,
  specialInstructions: String,
  
  // Kết quả tổng
  overallInterpretation: String,
  recommendations: String,
  
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
labOrderSchema.index({ patientId: 1, orderDate: -1 });
labOrderSchema.index({ doctorId: 1 });
labOrderSchema.index({ orderId: 1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ 'tests.status': 1 });
labOrderSchema.index({ priority: 1 });

// Virtuals
labOrderSchema.virtual('completedTests').get(function() {
  return this.tests.filter(test => test.status === 'COMPLETED').length;
});

labOrderSchema.virtual('pendingTests').get(function() {
  return this.tests.filter(test => 
    ['ORDERED', 'COLLECTED', 'IN_PROGRESS'].includes(test.status)
  ).length;
});

labOrderSchema.virtual('hasCriticalResults').get(function() {
  return this.tests.some(test => test.result && test.result.flag === 'CRITICAL');
});

labOrderSchema.virtual('isUrgent').get(function() {
  return this.priority === 'URGENT' || this.priority === 'STAT';
});

// Methods
labOrderSchema.methods.addTestResult = function(testId, result, performedBy) {
  const test = this.tests.id(testId);
  if (!test) {
    throw new Error('Test not found in order');
  }
  
  test.result = result;
  test.status = 'COMPLETED';
  test.completedDate = new Date();
  test.performedBy = performedBy;
  
  // Update overall status if all tests are completed
  const allCompleted = this.tests.every(t => t.status === 'COMPLETED');
  if (allCompleted) {
    this.status = 'COMPLETED';
  }
};

labOrderSchema.methods.markTestInProgress = function(testId, performedBy) {
  const test = this.tests.id(testId);
  if (!test) {
    throw new Error('Test not found in order');
  }
  
  test.status = 'IN_PROGRESS';
  test.startedDate = new Date();
  test.performedBy = performedBy;
  
  if (this.status === 'ORDERED') {
    this.status = 'IN_PROGRESS';
  }
};

labOrderSchema.methods.verifyTestResult = function(testId, verifiedBy) {
  const test = this.tests.id(testId);
  if (!test) {
    throw new Error('Test not found in order');
  }
  
  if (!test.result) {
    throw new Error('No result to verify');
  }
  
  test.result.verifiedBy = verifiedBy;
  test.result.verifiedAt = new Date();
};

// Statics
labOrderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('patientId doctorId')
    .populate('tests.testId');
};

labOrderSchema.statics.findPendingOrders = function() {
  return this.find({
    status: { $in: ['ORDERED', 'IN_PROGRESS'] }
  }).populate('patientId doctorId');
};

labOrderSchema.statics.findCriticalResults = function(startDate, endDate) {
  return this.find({
    'tests.result.flag': 'CRITICAL',
    orderDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId doctorId');
};

labOrderSchema.statics.findByPatientAndDate = function(patientId, startDate, endDate) {
  return this.find({
    patientId,
    orderDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('doctorId tests.testId');
};

module.exports = mongoose.model('LabOrder', labOrderSchema);