const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: [true, 'Vui lòng nhập tên khoa'], unique: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    
    type: {
      type: String,
      enum: {
        values: ['inpatient', 'outpatient', 'emergency', 'icu'],
        message: 'Loại khoa không hợp lệ'
      },
      default: 'outpatient'
    },

    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    doctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    beds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed'
    }],

    location: { type: String, trim: true },
    floor: { type: Number, min: 0 },
    building: String,
    
    contactNumber: { type: String, trim: true },
    contactPhone: String,
    email: String,

    workingHours: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    },

    status: { type: String, enum: ['active', 'ACTIVE', 'inactive', 'INACTIVE'], default: 'active' },
    
    statistics: {
      totalDoctors: { type: Number, default: 0 },
      totalBeds: { type: Number, default: 0 },
      occupiedBeds: { type: Number, default: 0 },
      currentPatients: { type: Number, default: 0 }
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 });
departmentSchema.index({ status: 1, isDeleted: 1 });
departmentSchema.index({ headOfDepartment: 1 });
departmentSchema.index({ type: 1 });

// Virtual for occupancy rate
departmentSchema.virtual('occupancyRate').get(function() {
  if (this.statistics.totalBeds === 0) return 0;
  return (this.statistics.occupiedBeds / this.statistics.totalBeds) * 100;
});

module.exports = mongoose.model('Department', departmentSchema);
