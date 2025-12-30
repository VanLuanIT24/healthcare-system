// src/models/appointment.model.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
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

  // Chuyên khoa của bác sĩ (lưu tại thời điểm đặt lịch)
  specialty: {
    type: String,
    required: true
  },
  
  // Thông tin lịch hẹn
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  type: {
    type: String,
    enum: ['CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'SURGERY', 'TEST', 'OTHER'],
    required: true
  },
  mode: {
    type: String,
    enum: ['IN_PERSON', 'TELEMEDICINE', 'PHONE'],
    default: 'IN_PERSON'
  },
  
  // Địa điểm
  location: {
    type: String,
    required: true
  },
  room: String,
  
  // Lý do và mô tả
  reason: {
    type: String,
    required: true
  },
  description: String,
  symptoms: [String],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  
  // Thông báo và nhắc nhở
  reminders: {
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    reminderDate: Date
  },
  
  // Thời gian thực tế
  actualStartTime: Date,
  actualEndTime: Date,
  waitTime: Number, // minutes
  
  // Hủy lịch
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationDate: Date,
    reason: String,
    notes: String
  },

  // Yêu cầu hủy của người dùng
  cancelRequest: {
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DECLINED'],
      default: null
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestDate: Date,
    reason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String
  },
  
  // Đánh dấu no-show
  noShow: {
    reason: String,
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: Date
  },

  // Ghi chú
  notes: String,
  preparationInstructions: String,
  
  // Đánh giá sau hẹn
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Tạo bởi
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

// ✅ FIX: Compound indexes chỉ - loại bỏ single field indexes trùng lặp
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });

// Virtuals
appointmentSchema.virtual('isPast').get(function() {
  return this.appointmentDate < new Date();
});

appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  return this.appointmentDate.toDateString() === today.toDateString();
});

appointmentSchema.virtual('timeUntilAppointment').get(function() {
  const now = new Date();
  return Math.round((this.appointmentDate - now) / (1000 * 60)); // minutes
});

// Methods
appointmentSchema.methods.cancel = function(cancelledBy, reason, notes = '') {
  this.status = 'CANCELLED';
  this.cancellation = {
    cancelledBy,
    cancellationDate: new Date(),
    reason,
    notes
  };
};

appointmentSchema.methods.markAsNoShow = function() {
  this.status = 'NO_SHOW';
};

appointmentSchema.methods.startAppointment = function() {
  this.status = 'IN_PROGRESS';
  this.actualStartTime = new Date();
};

appointmentSchema.methods.completeAppointment = function() {
  this.status = 'COMPLETED';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    this.waitTime = Math.round(
      (this.actualStartTime - this.appointmentDate) / (1000 * 60)
    ); // minutes
  }
};

// Statics
appointmentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId doctorId');
};

appointmentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId doctorId');
};

appointmentSchema.statics.findDoctorSchedule = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] }
  }).sort({ appointmentDate: 1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);