const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['RECEIVE', 'ISSUE', 'ADJUST'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  notes: String,
  referenceId: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true
  },
  category: String,
  unit: {
    type: String,
    default: 'unit'
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  reorderThreshold: {
    type: Number,
    default: 0
  },
  minQuantity: Number,
  maxQuantity: Number,
  location: String,
  costPerUnit: {
    type: Number,
    default: 0
  },
  expirationDate: Date,
  batchNumbers: [String],
  metadata: mongoose.Schema.Types.Mixed,
  logs: [inventoryLogSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

inventoryItemSchema.index({ name: 1, sku: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
