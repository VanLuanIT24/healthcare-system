const mongoose = require('mongoose');

const bedAssignmentHistorySchema = new mongoose.Schema({
  patientId: String,
  patientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  admittedAt: Date,
  dischargedAt: Date,
  bedNumber: String,
  roomNumber: String,
  ward: String,
  notes: String
}, { _id: false });

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  label: String,
  roomNumber: String,
  ward: String,
  floor: String,
  
  // Loại giường
  bedType: {
    type: String,
    enum: ['standard', 'vip', 'icu', 'isolation', 'intensive'],
    default: 'standard'
  },
  
  // Tính năng và tiện nghi
  amenities: {
    airConditioning: { type: Boolean, default: false },
    television: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    sideTable: { type: Boolean, default: true },
    privateToilet: { type: Boolean, default: false },
    showerFacility: { type: Boolean, default: false },
    oxygen: { type: Boolean, default: true },
    monitoring: { type: Boolean, default: false }
  },
  
  // Giá cả
  dailyRate: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },
  
  // Thông tin bệnh nhân hiện tại
  currentPatientId: String,
  currentPatientRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  assignedAt: Date,
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expectedDischargeDate: Date,
  diagnosis: String,
  
  // Ghi chú cập nhật
  lastUpdateNotes: String,
  
  // Lịch sử phân công giường
  history: [bedAssignmentHistorySchema],
  
  // Lịch sử bảo trì
  maintenanceHistory: [{
    date: { type: Date, default: Date.now },
    type: String,
    description: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    notes: String
  }],
  
  // Tags và metadata
  tags: [String],
  meta: mongoose.Schema.Types.Mixed,
  
  // Khoa/phòng ban
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  
  // Người tạo/cập nhật
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

bedSchema.index({ roomNumber: 1, bedNumber: 1 });
bedSchema.index({ bedType: 1, status: 1 });
bedSchema.index({ department: 1, status: 1 });
bedSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('Bed', bedSchema);
