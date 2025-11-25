const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    relationship: {
      type: String,
      enum: [
        "SPOUSE",
        "PARENT",
        "SIBLING",
        "CHILD",
        "GRANDPARENT",
        "AUNT_UNCLE",
        "COUSIN",
        "FRIEND",
        "CAREGIVER",
        "OTHER",
      ],
      required: true,
    },

    relationshipOther: {
      type: String,
      trim: true,
    },

    // Contact Methods
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^(\+?84|0)?[0-9]{9,10}$/,
    },

    alternatePhone: {
      type: String,
      trim: true,
      match: /^(\+?84|0)?[0-9]{9,10}$/,
    },

    email: {
      type: String,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Address
    address: {
      street: String,
      city: String,
      district: String,
      ward: String,
      zipCode: String,
      country: {
        type: String,
        default: "Vietnam",
      },
    },

    // Employer Info
    employer: String,
    workPhone: String,

    // Notification Preferences
    notificationMethods: {
      phone: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
    },

    // Priority
    priority: {
      type: Number,
      min: 1,
      default: 1,
      index: true,
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

    isTertiary: {
      type: Boolean,
      default: false,
    },

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: Date,

    lastContactedAt: Date,

    // Additional Info
    notes: {
      type: String,
      trim: true,
    },

    // Tracking
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PENDING_VERIFICATION"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "emergencyContacts",
  }
);

// Index for getting primary contact
emergencyContactSchema.index({ patientId: 1, priority: 1 });
emergencyContactSchema.index({ patientId: 1, isPrimary: 1 });

// Middleware to ensure only one primary contact per patient
emergencyContactSchema.pre("save", async function (next) {
  if (this.isPrimary) {
    // Unset isPrimary for other contacts of this patient
    await this.constructor.updateMany(
      { patientId: this.patientId, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);
