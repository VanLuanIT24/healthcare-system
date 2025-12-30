const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'REMINDER', 'ERROR', 'INFO'],
    default: 'SYSTEM'
  },
  channel: {
    type: String,
    enum: ['IN_APP', 'EMAIL', 'SMS'],
    default: 'IN_APP'
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toRole: String,
  metadata: mongoose.Schema.Types.Mixed,
  tags: [String],
  status: {
    type: String,
    enum: ['UNREAD', 'READ', 'ARCHIVED'],
    default: 'UNREAD'
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

notificationSchema.index({ toUserId: 1, toRole: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
