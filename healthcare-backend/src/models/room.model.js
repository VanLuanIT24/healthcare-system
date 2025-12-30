const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  ward: String,
  floor: String,
  type: String,
  capacity: {
    type: Number,
    default: 1
  },
  tags: [String],
  notes: String,
  beds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bed' }],
  meta: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

roomSchema.index({ ward: 1, roomNumber: 1 });

module.exports = mongoose.model('Room', roomSchema);
