const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  queueId: {
    type: String,
    required: true,
    unique: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
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
  department: String,
  queueDate: {
    type: Date,
    required: true
  },
  queueNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED', 'RECALLED', 'COMPLETED'],
    default: 'WAITING'
  },
  type: {
    type: String,
    enum: ['APPOINTMENT', 'WALK_IN'],
    default: 'APPOINTMENT'
  },
  reason: String,
  waitEstimate: Number,
  queuedAt: {
    type: Date,
    default: Date.now
  },
  calledAt: Date,
  calledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  skippedAt: Date,
  skippedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  skipReason: String,
  recalledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastRecalledAt: Date,
  recallCount: {
    type: Number,
    default: 0
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

queueSchema.index({ doctorId: 1, queueDate: 1, queueNumber: 1 });
queueSchema.index({ status: 1, doctorId: 1 });
queueSchema.index({ department: 1, queueDate: 1 });

module.exports = mongoose.model('QueueEntry', queueSchema);
