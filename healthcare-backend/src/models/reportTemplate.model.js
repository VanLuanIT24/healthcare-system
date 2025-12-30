const mongoose = require('mongoose');

const reportTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    config: { type: mongoose.Schema.Types.Mixed }, // flexible payload for builder
    query: { type: mongoose.Schema.Types.Mixed },
    layout: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

reportTemplateSchema.index({ name: 1, category: 1 }, { unique: false });

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);
