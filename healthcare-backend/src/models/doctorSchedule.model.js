// src/models/doctorSchedule.model.js
const mongoose = require('mongoose');

/**
 * Schema cho lịch làm việc của bác sĩ
 * Lưu trữ thông tin về thời gian làm việc, ngày nghỉ, slots khám
 */
const doctorScheduleSchema = new mongoose.Schema({
  // Bác sĩ
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Loại lịch: REGULAR (lịch cố định hàng tuần), SPECIAL (lịch đặc biệt cho ngày cụ thể), LEAVE (ngày nghỉ)
  scheduleType: {
    type: String,
    enum: ['REGULAR', 'SPECIAL', 'LEAVE'],
    default: 'REGULAR'
  },

  // Ngày trong tuần (0=CN, 1=T2, ..., 6=T7) - dùng cho REGULAR schedule
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },

  // Ngày cụ thể - dùng cho SPECIAL schedule hoặc LEAVE
  specificDate: {
    type: Date
  },

  // Thời gian bắt đầu (HH:mm format)
  startTime: {
    type: String,
    required: function() {
      return this.scheduleType !== 'LEAVE';
    }
  },

  // Thời gian kết thúc (HH:mm format)
  endTime: {
    type: String,
    required: function() {
      return this.scheduleType !== 'LEAVE';
    }
  },

  // Thời gian nghỉ trưa (optional)
  breakStart: {
    type: String // HH:mm format
  },
  breakEnd: {
    type: String // HH:mm format
  },

  // Thời lượng mỗi slot khám (phút)
  slotDuration: {
    type: Number,
    default: 30,
    min: 10,
    max: 120
  },

  // Số bệnh nhân tối đa mỗi slot
  maxPatientsPerSlot: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },

  // Phòng khám
  room: {
    type: String
  },

  // Khoa/phòng ban
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },

  // Loại dịch vụ khám
  consultationType: {
    type: String,
    enum: ['IN_PERSON', 'ONLINE', 'BOTH'],
    default: 'IN_PERSON'
  },

  // Lý do nghỉ (nếu scheduleType === 'LEAVE')
  leaveReason: {
    type: String
  },

  // Trạng thái
  isActive: {
    type: Boolean,
    default: true
  },

  // Ngày hiệu lực (cho REGULAR schedule)
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date
  },

  // Ghi chú
  notes: {
    type: String
  },

  // Người tạo
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Người cập nhật cuối
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
doctorScheduleSchema.index({ doctor: 1, dayOfWeek: 1, scheduleType: 1 });
doctorScheduleSchema.index({ doctor: 1, specificDate: 1 });
doctorScheduleSchema.index({ doctor: 1, isActive: 1 });

// Virtual: Tính số slots có thể đặt
doctorScheduleSchema.virtual('availableSlots').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  // Trừ thời gian nghỉ trưa
  if (this.breakStart && this.breakEnd) {
    const [breakStartHour, breakStartMin] = this.breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMin] = this.breakEnd.split(':').map(Number);
    const breakMinutes = (breakEndHour * 60 + breakEndMin) - (breakStartHour * 60 + breakStartMin);
    totalMinutes -= breakMinutes;
  }
  
  return Math.floor(totalMinutes / this.slotDuration);
});

// Method: Lấy danh sách time slots
doctorScheduleSchema.methods.getTimeSlots = function() {
  if (!this.startTime || !this.endTime) return [];
  
  const slots = [];
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes + this.slotDuration <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    const slotTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    
    // Skip break time
    if (this.breakStart && this.breakEnd) {
      const [breakStartHour, breakStartMin] = this.breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMin] = this.breakEnd.split(':').map(Number);
      const breakStart = breakStartHour * 60 + breakStartMin;
      const breakEnd = breakEndHour * 60 + breakEndMin;
      
      if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
        currentMinutes = breakEnd;
        continue;
      }
    }
    
    slots.push(slotTime);
    currentMinutes += this.slotDuration;
  }
  
  return slots;
};

// Statics: Lấy lịch làm việc của bác sĩ theo ngày
doctorScheduleSchema.statics.getScheduleForDate = async function(doctorId, date) {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  
  // Tạo ngày bắt đầu và kết thúc để query
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Kiểm tra ngày nghỉ trước
  const leaveSchedule = await this.findOne({
    doctor: doctorId,
    scheduleType: 'LEAVE',
    specificDate: {
      $gte: dayStart,
      $lt: dayEnd
    },
    isActive: true
  });
  
  if (leaveSchedule) {
    return { isLeave: true, leaveReason: leaveSchedule.leaveReason };
  }
  
  // Kiểm tra lịch đặc biệt cho ngày đó
  const specialSchedule = await this.findOne({
    doctor: doctorId,
    scheduleType: 'SPECIAL',
    specificDate: {
      $gte: dayStart,
      $lt: dayEnd
    },
    isActive: true
  });
  
  if (specialSchedule) {
    return specialSchedule;
  }
  
  // Lấy lịch cố định theo ngày trong tuần
  const regularSchedule = await this.findOne({
    doctor: doctorId,
    scheduleType: 'REGULAR',
    dayOfWeek: dayOfWeek,
    isActive: true,
    effectiveFrom: { $lte: targetDate },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: targetDate } }
    ]
  });
  
  return regularSchedule;
};

// Statics: Lấy tất cả lịch của bác sĩ trong khoảng thời gian
doctorScheduleSchema.statics.getScheduleRange = async function(doctorId, startDate, endDate) {
  const schedules = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const schedule = await this.getScheduleForDate(doctorId, current);
    schedules.push({
      date: new Date(current),
      schedule
    });
    current.setDate(current.getDate() + 1);
  }
  
  return schedules;
};

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule', doctorScheduleSchema);

module.exports = DoctorSchedule;
