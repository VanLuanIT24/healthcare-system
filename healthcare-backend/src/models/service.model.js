// src/models/service.model.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['EXAMINATION', 'LAB', 'IMAGING', 'PROCEDURE', 'TEST', 'OTHER'],
    uppercase: true
  },
  unit: {
    type: String,
    default: 'Lần',
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index để tìm kiếm nhanh
serviceSchema.index({ code: 1 });
serviceSchema.index({ name: 'text', code: 'text', description: 'text' });
serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);