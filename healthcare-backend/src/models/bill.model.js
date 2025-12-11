// src/models/bill.model.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Thông tin hóa đơn
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  billType: {
    type: String,
    enum: ['CONSULTATION', 'LABORATORY', 'PHARMACY', 'PROCEDURE', 'HOSPITALIZATION', 'OTHER'],
    required: true
  },
  
  // Chi tiết dịch vụ
  services: [{
    serviceCode: String,
    serviceName: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  
  // Tính toán tổng
  subtotal: {
    type: Number,
    required: true
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    required: true
  },
  
  // Thông tin bảo hiểm
  insurance: {
    provider: String,
    policyNumber: String,
    coverageAmount: Number,
    deductible: Number,
    coPayment: Number,
    notes: String
  },
  
  // Thanh toán
  payments: [{
    paymentId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'BANK_TRANSFER', 'OTHER']
    },
    reference: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
    },
    notes: String
  }],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'WRITTEN_OFF', 'VOIDED'],
    default: 'DRAFT'
  },
  
  // Ghi chú
  notes: String,
  terms: String,
  
  // Tạo và xử lý
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ FIX: Compound indexes chỉ - loại bỏ single field indexes trùng lặp
billSchema.index({ patientId: 1, issueDate: -1 });
billSchema.index({ status: 1, dueDate: 1 });

// Virtuals
billSchema.virtual('isOverdue').get(function() {
  return this.status === 'ISSUED' && new Date() > this.dueDate;
});

billSchema.virtual('paymentProgress').get(function() {
  return (this.amountPaid / this.grandTotal) * 100;
});

billSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  return Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
});

// Methods
billSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  this.amountPaid += paymentData.amount;
  this.balanceDue = this.grandTotal - this.amountPaid;
  
  // Update status
  if (this.balanceDue <= 0) {
    this.status = 'PAID';
  } else if (this.amountPaid > 0) {
    this.status = 'PARTIAL';
  }
};

billSchema.methods.calculateTotals = function() {
  this.subtotal = this.services.reduce((sum, service) => {
    const serviceTotal = service.quantity * service.unitPrice;
    const afterDiscount = serviceTotal - service.discount;
    return sum + afterDiscount;
  }, 0);
  
  this.totalDiscount = this.services.reduce((sum, service) => 
    sum + service.discount, 0
  );
  
  this.totalTax = this.services.reduce((sum, service) => {
    const serviceTotal = service.quantity * service.unitPrice - service.discount;
    return sum + (serviceTotal * (service.taxRate / 100));
  }, 0);
  
  this.grandTotal = this.subtotal + this.totalTax;
  this.balanceDue = this.grandTotal - this.amountPaid;
};

// Statics
billSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId');
};

billSchema.statics.findOverdueBills = function() {
  return this.find({
    status: { $in: ['ISSUED', 'PARTIAL'] },
    dueDate: { $lt: new Date() }
  }).populate('patientId');
};

billSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    issueDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId');
};

module.exports = mongoose.model('Bill', billSchema);