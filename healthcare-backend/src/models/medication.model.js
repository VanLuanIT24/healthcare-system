const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  medicationId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'INHALER', 'SUPPOSITORY', 'OTHER'],
    required: true
  },
  strength: {
    value: Number,
    unit: String
  },
  form: String,
  
  // Thông tin kho
  stock: {
    current: {
      type: Number,
      default: 0
    },
    minimum: {
      type: Number,
      default: 10
    },
    maximum: {
      type: Number,
      default: 1000
    },
    unit: {
      type: String,
      default: 'units'
    },
    lastRestocked: Date,
    reorderLevel: {
      type: Number,
      default: 20
    }
  },
  
  // Giá cả
  pricing: {
    costPrice: Number,
    sellingPrice: Number,
    insurancePrice: Number
  },
  
  // Thông tin bảo quản
  storage: {
    temperature: String,
    requirements: String,
    lightSensitive: {
      type: Boolean,
      default: false
    },
    humiditySensitive: {
      type: Boolean,
      default: false
    }
  },
  
  // Thông tin an toàn
  safety: {
    schedule: {
      type: String,
      enum: ['OTC', 'RX', 'CONTROLLED']
    },
    pregnancyCategory: String,
    contraindications: [String],
    sideEffects: [String],
    interactions: [{
      medication: String,
      severity: String,
      effect: String
    }]
  },
  
  // Thông tin bảo hiểm
  insurance: {
    covered: {
      type: Boolean,
      default: false
    },
    priorAuthorization: {
      type: Boolean,
      default: false
    },
    quantityLimits: {
      type: Boolean,
      default: false
    },
    stepTherapy: {
      type: Boolean,
      default: false
    }
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'RECALLED'],
    default: 'ACTIVE'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ FIX: Compound indexes và text search
medicationSchema.index({ name: 'text', genericName: 'text' });
medicationSchema.index({ category: 1, status: 1 });
medicationSchema.index({ 'stock.current': 1, status: 1 });

// Virtuals
medicationSchema.virtual('isLowStock').get(function() {
  return this.stock.current <= this.stock.reorderLevel;
});

medicationSchema.virtual('isOutOfStock').get(function() {
  return this.stock.current <= 0;
});

// Methods
medicationSchema.methods.updateStock = function(quantity, type = 'IN') {
  if (type === 'IN') {
    this.stock.current += quantity;
  } else if (type === 'OUT') {
    if (this.stock.current < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock.current -= quantity;
  }
  
  this.stock.lastRestocked = new Date();
};

medicationSchema.methods.checkAvailability = function(quantity) {
  return {
    available: this.stock.current >= quantity,
    currentStock: this.stock.current,
    required: quantity,
    shortage: Math.max(0, quantity - this.stock.current)
  };
};

// Statics
medicationSchema.statics.findLowStock = function() {
  return this.find({
    'stock.current': { $lte: { $expr: '$stock.reorderLevel' } },
    status: 'ACTIVE'
  });
};

medicationSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'ACTIVE' });
};

medicationSchema.statics.searchMedications = function(searchTerm) {
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { genericName: new RegExp(searchTerm, 'i') },
      { brandName: new RegExp(searchTerm, 'i') }
    ],
    status: 'ACTIVE'
  });
};

module.exports = mongoose.model('Medication', medicationSchema);