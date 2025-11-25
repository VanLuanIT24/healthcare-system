const mongoose = require("mongoose");

const insuranceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    insuranceType: {
      type: String,
      enum: ["HEALTH_INSURANCE", "ACCIDENT", "LIFE", "DISABILITY", "OTHER"],
      required: true,
    },

    insuranceProvider: {
      type: String,
      required: true,
      trim: true,
    },

    policyNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    groupNumber: {
      type: String,
      trim: true,
    },

    memberId: {
      type: String,
      trim: true,
    },

    // Holder Info
    holderName: {
      type: String,
      required: true,
      trim: true,
    },

    holderRelationship: {
      type: String,
      enum: ["SELF", "SPOUSE", "PARENT", "CHILD", "OTHER"],
      default: "SELF",
    },

    holderDateOfBirth: {
      type: Date,
    },

    // Coverage Details
    copay: {
      type: Number,
      min: 0,
      default: 0,
    },

    deductible: {
      type: Number,
      min: 0,
      default: 0,
    },

    outOfPocketMax: {
      type: Number,
      min: 0,
      default: 0,
    },

    coveragePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },

    // Dates
    effectiveDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "EXPIRED", "SUSPENDED", "TERMINATED"],
      default: "ACTIVE",
      index: true,
    },

    // Coverage Types
    coverageTypes: {
      outpatient: Boolean,
      inpatient: Boolean,
      emergency: Boolean,
      preventive: Boolean,
      prescription: Boolean,
      mental_health: Boolean,
      dental: Boolean,
      vision: Boolean,
      maternity: Boolean,
      pediatric: Boolean,
    },

    // Network
    networkType: {
      type: String,
      enum: ["HMO", "PPO", "EPO", "POS", "OTHER"],
      default: "PPO",
    },

    inNetworkProviders: [
      {
        providerName: String,
        speciality: String,
        phone: String,
      },
    ],

    // Documents
    documentUrl: {
      type: String,
      trim: true,
    },

    // Additional Info
    notes: {
      type: String,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },

    isSecondary: {
      type: Boolean,
      default: false,
    },

    // Coordination of Benefits
    coordinationOfBenefits: {
      type: Boolean,
      default: false,
    },

    // Claims
    totalClaimsSubmitted: {
      type: Number,
      default: 0,
    },

    totalClaimsApproved: {
      type: Number,
      default: 0,
    },

    totalAmountCovered: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Emergency Contact for Insurance
    emergencyContact: {
      name: String,
      phone: String,
      email: String,
    },

    // Tracking
    lastVerified: {
      type: Date,
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "FAILED", "EXPIRED"],
      default: "PENDING",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "insurance",
  }
);

// Index
insuranceSchema.index({ patientId: 1, isPrimary: 1 });
insuranceSchema.index({ patientId: 1, status: 1 });

// Middleware to validate dates
insuranceSchema.pre("save", function (next) {
  if (this.effectiveDate >= this.expiryDate) {
    return next(new Error("Effective date must be before expiry date"));
  }

  // Auto-update status if expired
  if (this.expiryDate < new Date()) {
    this.status = "EXPIRED";
  }

  next();
});

module.exports = mongoose.model("Insurance", insuranceSchema);
