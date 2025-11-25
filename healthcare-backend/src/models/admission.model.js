const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Admission Info
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    admissionDate: {
      type: Date,
      required: true,
      index: true,
    },

    dischargeDate: {
      type: Date,
    },

    admissionType: {
      type: String,
      enum: ["EMERGENCY", "URGENT", "PLANNED", "TRANSFER", "READMISSION"],
      required: true,
    },

    sourceOfAdmission: {
      type: String,
      enum: [
        "EMERGENCY_ROOM",
        "OUTPATIENT",
        "TRANSFER_FROM_HOSPITAL",
        "TRANSFER_FROM_CLINIC",
        "HOME",
        "OTHER",
      ],
      default: "EMERGENCY_ROOM",
    },

    // Status
    status: {
      type: String,
      enum: [
        "ACTIVE",
        "DISCHARGED",
        "TRANSFERRED",
        "ABSCONDED",
        "EXPIRED",
        "CANCELLED",
      ],
      default: "ACTIVE",
      index: true,
    },

    // Ward/Room Assignment
    ward: {
      type: String,
      required: true,
      trim: true,
    },

    room: {
      type: String,
      trim: true,
    },

    bed: {
      type: String,
      trim: true,
    },

    wardType: {
      type: String,
      enum: [
        "GENERAL",
        "PRIVATE",
        "ICU",
        "HDU",
        "CCU",
        "ISOLATION",
        "PEDIATRIC",
        "MATERNITY",
      ],
      default: "GENERAL",
    },

    // Attending Physician
    attendingPhysician: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      doctorName: String,
    },

    // Department
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    departmentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Diagnosis & Treatment
    primaryDiagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    icdCode: String,

    secondaryDiagnoses: [String],

    reasonForAdmission: {
      type: String,
      required: true,
      trim: true,
    },

    chiefComplaint: String,

    // Clinical Summary
    clinicalSummary: String,

    treatmentPlan: String,

    // Vital Signs at Admission
    vitalSignsAtAdmission: {
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
    },

    // Vital Signs at Discharge
    vitalSignsAtDischarge: {
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
    },

    // Procedures
    procedures: [
      {
        procedureName: String,
        procedureCode: String,
        procedureDate: Date,
        description: String,
      },
    ],

    // Medications Given During Stay
    medicationsGivenDuringStay: [
      {
        medicationName: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        reason: String,
      },
    ],

    // Investigations/Tests Done
    investigations: [
      {
        testName: String,
        testDate: Date,
        result: String,
        status: String,
      },
    ],

    // Allergy Alert
    allergyAlert: {
      hasAllergies: Boolean,
      allergies: [String],
    },

    // Lab/Imaging Performed
    labOrderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabOrder",
      },
    ],

    // Transfers
    transfers: [
      {
        transferDate: Date,
        fromWard: String,
        toWard: String,
        reason: String,
      },
    ],

    // Discharge Info
    dischargeType: {
      type: String,
      enum: [
        "HOME",
        "TRANSFER_TO_FACILITY",
        "TRANSFERRED_TO_HOSPITAL",
        "ABSCONDED",
        "DECEASED",
        "SIGNED_OUT_AGAINST_ADVICE",
      ],
      default: "HOME",
    },

    dischargeDiagnosis: String,

    dischargeCondition: {
      type: String,
      enum: ["IMPROVED", "STABLE", "UNCHANGED", "WORSE", "DECEASED"],
      default: "IMPROVED",
    },

    dischargeSummary: String,

    dischargePlan: String,

    followUpNeeded: Boolean,

    followUpInstructions: String,

    // Medications at Discharge
    dischargemedications: [
      {
        medicationName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],

    // Restrictions
    activityRestrictions: String,

    dietaryRestrictions: String,

    workRestrictions: String,

    // Advance Directives
    advanceDirectivesPresent: Boolean,

    advanceDirectiveDetails: String,

    // Emergency Contact Present During Admission
    emergencyContactPresentDuring: {
      name: String,
      relationship: String,
      phone: String,
    },

    // Consent
    consentForTreatment: {
      type: Boolean,
      default: true,
    },

    surgericalConsentGiven: Boolean,

    // Insurance
    insuranceVerified: Boolean,

    insurancePolicyNumber: String,

    insuranceClaimId: String,

    // Billing
    totalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Tracking
    notes: String,

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    attachmentUrls: [String],

    lengthOfStay: Number, // days
  },
  {
    timestamps: true,
    collection: "admissions",
  }
);

// Calculate length of stay before saving
admissionSchema.pre("save", function (next) {
  if (this.dischargeDate && this.admissionDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    this.lengthOfStay = Math.floor(
      (this.dischargeDate - this.admissionDate) / msPerDay
    );
  }
  next();
});

// Indexes
admissionSchema.index({ patientId: 1, admissionDate: -1 });
admissionSchema.index({ patientId: 1, status: 1 });
admissionSchema.index({ admissionNumber: 1 });
admissionSchema.index({ departmentId: 1, admissionDate: 1 });

module.exports = mongoose.model("Admission", admissionSchema);
