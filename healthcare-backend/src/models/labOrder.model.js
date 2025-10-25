// models/labOrder.model.js
const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
  orderId: {
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
  
  // Thông tin đơn xét nghiệm
  orderDate: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['ROUTINE', 'URGENT', 'STAT'],
    default: 'ROUTINE'
  },
  
  // Danh sách xét nghiệm
  tests: [{
    testCode: String,
    testName: {
      type: String,
      required: true
    },
    category: String,
    specimenType: {
      type: String,
      enum: ['BLOOD', 'URINE', 'STOOL', 'TISSUE', 'SALIVA', 'OTHER']
    },
    specimenRequirements: String,
    instructions: String,
    
    // Kết quả
    result: {
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      normalRange: String,
      flag: {
        type: String,
        enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL']
      },
      notes: String
    },
    
    // Trạng thái
    status: {
      type: String,
      enum: ['ORDERED', 'COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'ORDERED'
    },
    
    // Thời gian
    collectionDate: Date,
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
      uploadDate: Date
    }]
  }],
  
  // Chỉ định lâm sàng
  clinicalIndication: String,
  differentialDiagnosis: [String],
  
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
  specialInstructions: String
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

// Methods
labOrderSchema.methods.addTestResult = function(testIndex, result, performedBy) {
  if (testIndex >= this.tests.length) {
    throw new Error('Invalid test index');
  }
  
  const test = this.tests[testIndex];
  test.result = result;
  test.status = 'COMPLETED';
  test.completedDate = new Date();
  test.performedBy = performedBy;
};

labOrderSchema.methods.markTestInProgress = function(testIndex, performedBy) {
  if (testIndex >= this.tests.length) {
    throw new Error('Invalid test index');
  }
  
  this.tests[testIndex].status = 'IN_PROGRESS';
  this.tests[testIndex].performedBy = performedBy;
};

// Statics
labOrderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId doctorId');
};

labOrderSchema.statics.findPendingOrders = function() {
  return this.find({
    status: { $in: ['ORDERED', 'IN_PROGRESS'] }
  });
};

labOrderSchema.statics.findCriticalResults = function(startDate, endDate) {
  return this.find({
    'tests.result.flag': 'CRITICAL',
    orderDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('LabOrder', labOrderSchema);