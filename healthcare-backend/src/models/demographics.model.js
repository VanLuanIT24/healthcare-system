const mongoose = require("mongoose");

const demographicsSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Basic Info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    // Address (multiple)
    addresses: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        district: {
          type: String,
          trim: true,
        },
        ward: {
          type: String,
          trim: true,
        },
        zipCode: {
          type: String,
          trim: true,
        },
        country: {
          type: String,
          default: "Vietnam",
          trim: true,
        },
        addressType: {
          type: String,
          enum: ["HOME", "WORK", "OTHER"],
          default: "HOME",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Contact Info
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^(\+?84|0)[0-9]{9,10}$/,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    alternatePhone: {
      type: String,
      trim: true,
      match: /^(\+?84|0)?[0-9]{9,10}$/,
    },

    alternateEmail: {
      type: String,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Employment
    occupation: {
      type: String,
      trim: true,
    },

    employer: {
      type: String,
      trim: true,
    },

    workPhone: {
      type: String,
      trim: true,
    },

    workAddress: {
      type: String,
      trim: true,
    },

    // Identity
    identityType: {
      type: String,
      enum: ["CCCD", "PASSPORT", "DRIVER_LICENSE", "OTHER"],
      required: true,
    },

    identityNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    issuedDate: {
      type: Date,
      required: true,
    },

    issuedPlace: {
      type: String,
      trim: true,
    },

    expiryDate: {
      type: Date,
    },

    // Marital Status
    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "PREFER_NOT_TO_SAY"],
      default: "PREFER_NOT_TO_SAY",
    },

    // Next of Kin
    nextOfKin: {
      name: String,
      relationship: {
        type: String,
        enum: ["SPOUSE", "PARENT", "SIBLING", "CHILD", "OTHER"],
      },
      phone: String,
      email: String,
      address: String,
    },

    // Additional Info
    language: {
      type: String,
      default: "VI",
      enum: ["VI", "EN", "FR", "CH"],
    },

    bloodType: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "UNKNOWN"],
      default: "UNKNOWN",
    },

    organDonor: {
      type: Boolean,
      default: false,
    },

    // Tracking
    isVerified: {
      type: Boolean,
      default: false,
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "demographics",
  }
);

// Index for search
demographicsSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

// Virtual for full name
demographicsSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware to set isVerified when created
demographicsSchema.pre("save", function (next) {
  if (!this.isNew) return next();

  // Set isVerified based on identity verification
  if (this.identityNumber && this.issuedDate) {
    this.isVerified = true;
  }

  next();
});

module.exports = mongoose.model("Demographics", demographicsSchema);
