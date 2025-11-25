const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Personal Medical History
    personalHistory: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        condition: {
          type: String,
          required: true,
          trim: true,
        },
        icdCode: {
          type: String,
          trim: true,
        },
        diagnosisDate: {
          type: Date,
          required: true,
        },
        resolutionDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["ACTIVE", "RESOLVED", "RECURRING", "CHRONIC", "IN_REMISSION"],
          default: "ACTIVE",
        },
        severity: {
          type: String,
          enum: ["MILD", "MODERATE", "SEVERE"],
          default: "MODERATE",
        },
        notes: String,
        treatmentDetails: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Family Medical History
    familyHistory: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        relation: {
          type: String,
          enum: [
            "FATHER",
            "MOTHER",
            "SIBLING",
            "CHILD",
            "GRANDPARENT",
            "AUNT_UNCLE",
            "COUSIN",
            "OTHER",
          ],
          required: true,
        },
        relationName: String,
        condition: {
          type: String,
          required: true,
          trim: true,
        },
        icdCode: {
          type: String,
          trim: true,
        },
        ageOfOnset: Number,
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Allergies
    allergies: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        allergen: {
          type: String,
          required: true,
          trim: true,
        },
        allergenType: {
          type: String,
          enum: ["MEDICATION", "FOOD", "ENVIRONMENTAL", "OTHER"],
          default: "OTHER",
        },
        reactionType: {
          type: String,
          enum: ["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"],
          required: true,
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
        onset: String,
        treatment: String,
        verified: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Vaccinations
    vaccinations: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        vaccineType: {
          type: String,
          required: true,
          trim: true,
        },
        vaccineCode: {
          type: String,
          trim: true,
        },
        manufacturer: String,
        batchNumber: String,

        vaccinationDate: {
          type: Date,
          required: true,
        },

        nextDueDate: {
          type: Date,
        },

        expiryDate: {
          type: Date,
        },

        status: {
          type: String,
          enum: ["UP_TO_DATE", "DUE_SOON", "OVERDUE", "PENDING"],
          default: "UP_TO_DATE",
        },

        doseNumber: Number,
        totalDoses: Number,

        administeredBy: String,
        site: {
          type: String,
          enum: ["LEFT_ARM", "RIGHT_ARM", "LEFT_LEG", "RIGHT_LEG", "OTHER"],
        },

        reaction: String,
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Current Medications (Not from prescriptions)
    currentMedications: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        medicationName: {
          type: String,
          required: true,
          trim: true,
        },
        medicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medication",
        },
        dosage: {
          type: String,
          required: true,
          trim: true,
        },
        dosageUnit: {
          type: String,
          enum: [
            "mg",
            "ml",
            "g",
            "mcg",
            "IU",
            "tablets",
            "capsules",
            "patches",
          ],
          default: "mg",
        },
        frequency: {
          type: String,
          required: true,
          trim: true,
        },
        route: {
          type: String,
          enum: ["ORAL", "INJECTION", "TOPICAL", "INHALATION", "IV", "OTHER"],
          default: "ORAL",
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date,
        reason: String,
        prescribedBy: String,
        sideEffects: [String],
        interactions: [String],
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Surgical History
    surgicalHistory: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        procedureName: {
          type: String,
          required: true,
          trim: true,
        },
        procedureCode: String,
        surgeryDate: {
          type: Date,
          required: true,
        },
        surgeon: String,
        facility: String,
        anesthesia: String,
        complications: String,
        outcome: String,
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Hospitalization History
    hospitalizationHistory: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        admissionDate: {
          type: Date,
          required: true,
        },
        dischargeDate: {
          type: Date,
          required: true,
        },
        facility: String,
        reason: String,
        diagnosis: String,
        treatment: String,
        outcome: String,
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Lifestyle
    lifestyleFactors: {
      smokingStatus: {
        type: String,
        enum: ["NEVER", "FORMER", "CURRENT", "UNKNOWN"],
        default: "UNKNOWN",
      },
      smokingDetails: String,

      alcoholConsumption: {
        type: String,
        enum: ["NONE", "LIGHT", "MODERATE", "HEAVY", "UNKNOWN"],
        default: "UNKNOWN",
      },

      drugUse: {
        type: String,
        enum: ["NONE", "FORMER", "CURRENT", "UNKNOWN"],
        default: "UNKNOWN",
      },
      drugDetails: String,

      exerciseFrequency: String,
      diet: String,
      sleepPattern: String,
      stress: String,
    },

    // Environmental
    environmentalExposures: [
      {
        exposure: String,
        duration: String,
        effect: String,
      },
    ],

    // Tracking
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastReviewedAt: Date,
  },
  {
    timestamps: true,
    collection: "medicalHistory",
  }
);

// Indexes
medicalHistorySchema.index({ patientId: 1 });
medicalHistorySchema.index({ "allergies.allergen": 1 });
medicalHistorySchema.index({ "vaccinations.status": 1 });

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);
