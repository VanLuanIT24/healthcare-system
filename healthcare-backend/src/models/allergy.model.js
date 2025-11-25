const mongoose = require("mongoose");

const allergySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    allergen: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    allergenType: {
      type: String,
      enum: [
        "MEDICATION",
        "FOOD",
        "ENVIRONMENTAL",
        "LATEX",
        "CONTRAST_DYE",
        "OTHER",
      ],
      required: true,
      index: true,
    },

    allergenCode: String,

    // Reaction Details
    reactionType: {
      type: String,
      enum: ["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"],
      required: true,
      index: true,
    },

    reaction: {
      type: String,
      required: true,
      trim: true,
    },

    symptoms: [String],

    severity: {
      type: String,
      enum: ["MILD", "MODERATE", "SEVERE"],
      default: "MODERATE",
    },

    // Onset & Duration
    onsetTime: String,

    duration: String,

    // Management
    treatment: String,

    managementNotes: String,

    // Prevention
    avoidanceInstructions: String,

    // Cross-Reactivity
    crossReactiveAllergens: [String],

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationMethod: {
      type: String,
      enum: [
        "ALLERGY_TEST",
        "PATIENT_REPORT",
        "MEDICAL_RECORD",
        "PHYSICIAN_ASSESSMENT",
        "OTHER",
      ],
      default: "PATIENT_REPORT",
    },

    verifiedDate: Date,

    testResults: String,

    // Emergency
    requiresEpiPen: Boolean,

    epiPenPrescriptionId: mongoose.Schema.Types.ObjectId,

    // First Occurrence
    firstOccurrenceDate: Date,

    lastOccurrenceDate: Date,

    occurrenceCount: {
      type: Number,
      default: 1,
    },

    // Active Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED", "SUSPECTED", "UNCONFIRMED"],
      default: "ACTIVE",
    },

    // Medication Interaction
    conflictingMedications: [
      {
        medicationName: String,
        reason: String,
      },
    ],

    // Documentation
    notes: String,

    attachmentUrl: String,

    // Tracking
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    recordedDate: Date,

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "allergies",
  }
);

// Indexes
allergySchema.index({ patientId: 1, isActive: 1 });
allergySchema.index({ patientId: 1, allergenType: 1 });
allergySchema.index({ allergen: 1 });

module.exports = mongoose.model("Allergy", allergySchema);
