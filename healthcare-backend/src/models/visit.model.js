const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // Visit Info
    visitType: {
      type: String,
      enum: ["IN_PERSON", "TELEHEALTH", "HOME_VISIT", "EMERGENCY", "FOLLOW_UP"],
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Provider Info
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    departmentName: {
      type: String,
      required: true,
      trim: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    // Chief Complaint
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    chiefComplaint: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "MISSED",
        "NO_SHOW",
      ],
      default: "SCHEDULED",
      index: true,
    },

    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Vital Signs
    vitals: {
      temperature: {
        type: Number,
        min: 35,
        max: 43,
      },
      bloodPressure: {
        type: String,
        match: /^\d{2,3}\/\d{2,3}$/, // Format: 120/80
      },
      heartRate: {
        type: Number,
        min: 30,
        max: 200,
      },
      respiratoryRate: {
        type: Number,
        min: 5,
        max: 50,
      },
      oxygenSaturation: {
        type: Number,
        min: 50,
        max: 100,
      },
      weight: {
        type: Number,
        min: 1,
        max: 500,
      },
      height: {
        type: Number,
        min: 50,
        max: 250,
      },
      bmi: Number,
      painScore: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    // Clinical Assessment
    diagnosis: {
      type: String,
      trim: true,
    },

    icdCodes: [String],

    assessment: {
      type: String,
      trim: true,
    },

    treatment: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    doctorNotes: {
      type: String,
      trim: true,
    },

    // Physical Examination
    physicalExamination: {
      head: String,
      cardiovascular: String,
      respiratory: String,
      abdomen: String,
      extremities: String,
      neurological: String,
      skin: String,
    },

    // Medications Discussed
    medicationsDiscussed: [
      {
        medicationName: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],

    // Related Documents
    prescriptionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prescription",
      },
    ],

    labOrderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabOrder",
      },
    ],

    medicalRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],

    // Visit Details
    duration: {
      type: Number,
      min: 0, // minutes
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: String,
    meetingLink: String, // For telehealth

    // Follow-up
    followUpRequired: {
      type: Boolean,
      default: false,
    },

    followUpDate: Date,
    followUpReason: String,

    // Recommendations
    recommendations: [
      {
        recommendation: String,
        category: {
          type: String,
          enum: [
            "LIFESTYLE",
            "DIET",
            "EXERCISE",
            "MEDICATION",
            "TESTING",
            "REFERRAL",
            "OTHER",
          ],
        },
        priority: {
          type: String,
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          default: "MEDIUM",
        },
      },
    ],

    // Referrals
    referrals: [
      {
        referralDate: Date,
        referredTo: String,
        referredDepartment: String,
        reason: String,
        status: {
          type: String,
          enum: ["PENDING", "ACCEPTED", "COMPLETED", "DECLINED"],
        },
      },
    ],

    // Tracking
    attachmentUrls: [String],

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "visits",
  }
);

// Indexes
visitSchema.index({ patientId: 1, visitDate: -1 });
visitSchema.index({ patientId: 1, status: 1 });
visitSchema.index({ doctorId: 1, visitDate: 1 });
visitSchema.index({ departmentId: 1, visitDate: 1 });

// Virtual for age calculation at visit time
visitSchema.virtual("ageAtVisit").get(function () {
  const patientAge = this.patientId?.dateOfBirth
    ? new Date().getFullYear() -
      new Date(this.patientId.dateOfBirth).getFullYear()
    : null;
  return patientAge;
});

module.exports = mongoose.model("Visit", visitSchema);
