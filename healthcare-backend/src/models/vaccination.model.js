const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    vaccineType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    vaccineCode: {
      type: String,
      trim: true,
    },

    vaccineFullName: String,

    manufacturer: String,

    batchNumber: String,

    vaccinationDate: {
      type: Date,
      required: true,
      index: true,
    },

    expiryDate: Date,

    nextDueDate: Date,

    status: {
      type: String,
      enum: [
        "UP_TO_DATE",
        "DUE_SOON",
        "OVERDUE",
        "PENDING",
        "NOT_RECOMMENDED",
        "DECLINED",
      ],
      default: "UP_TO_DATE",
      index: true,
    },

    doseNumber: Number,

    totalDoses: Number,

    // Administration Details
    administeredBy: {
      type: String,
      trim: true,
    },

    administeredAt: {
      type: String,
      trim: true,
    },

    site: {
      type: String,
      enum: ["LEFT_ARM", "RIGHT_ARM", "LEFT_LEG", "RIGHT_LEG", "OTHER"],
      default: "RIGHT_ARM",
    },

    route: {
      type: String,
      enum: ["INTRAMUSCULAR", "SUBCUTANEOUS", "ORAL", "INTRANASAL", "OTHER"],
      default: "INTRAMUSCULAR",
    },

    // Reaction
    hadReaction: {
      type: Boolean,
      default: false,
    },

    reaction: String,

    reactionSeverity: {
      type: String,
      enum: ["MILD", "MODERATE", "SEVERE"],
      default: "MILD",
    },

    adverseEventReported: Boolean,

    // Doctor Notes
    notes: String,

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationSource: {
      type: String,
      enum: [
        "PATIENT_RECORD",
        "HOSPITAL_RECORD",
        "CERTIFICATE",
        "VERBAL_REPORT",
        "OTHER",
      ],
      default: "PATIENT_RECORD",
    },

    certificateUrl: String,

    // Related Fields
    visitId: mongoose.Schema.Types.ObjectId,

    appointmentId: mongoose.Schema.Types.ObjectId,

    // Tracking
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "vaccinations",
  }
);

// Index
vaccinationSchema.index({ patientId: 1, vaccinationDate: -1 });
vaccinationSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);
