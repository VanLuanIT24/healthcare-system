const mongoose = require("mongoose");

const communicationThreadSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorName: String,

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    category: {
      type: String,
      enum: [
        "APPOINTMENT",
        "PRESCRIPTION",
        "GENERAL_INQUIRY",
        "FOLLOW_UP",
        "COMPLAINT",
        "FEEDBACK",
        "OTHER",
      ],
      default: "GENERAL_INQUIRY",
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_PATIENT",
        "WAITING_FOR_DOCTOR",
        "RESOLVED",
        "CLOSED",
        "ARCHIVED",
      ],
      default: "OPEN",
      index: true,
    },

    // Message Counts
    messageCount: {
      type: Number,
      default: 0,
    },

    unreadCount: {
      type: Number,
      default: 0,
    },

    // Participants
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        role: {
          type: String,
          enum: ["DOCTOR", "PATIENT", "ADMIN"],
          required: true,
        },
        joinedAt: Date,
        lastReadAt: Date,
      },
    ],

    // Last Activity
    lastMessageAt: Date,

    lastMessageBy: {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      role: String,
    },

    lastMessagePreview: String,

    // Related Entity
    relatedEntity: {
      entityType: {
        type: String,
        enum: [
          "APPOINTMENT",
          "PRESCRIPTION",
          "LAB_RESULT",
          "VISIT",
          "ADMISSION",
          "BILLING",
          "OTHER",
        ],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },

    // Archiving
    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: Date,

    archivedBy: mongoose.Schema.Types.ObjectId,

    // Rating (after resolution)
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    satisfactionComment: String,

    // Attachments
    attachmentCount: {
      type: Number,
      default: 0,
    },

    // SLA
    responseTime: Number, // minutes for first response

    resolutionTime: Number, // minutes to resolution

    // Tags
    tags: [String],
  },
  {
    timestamps: true,
    collection: "communicationThreads",
  }
);

// Indexes
communicationThreadSchema.index({ patientId: 1, createdAt: -1 });
communicationThreadSchema.index({ doctorId: 1, createdAt: -1 });
communicationThreadSchema.index({ patientId: 1, status: 1 });
communicationThreadSchema.index({ patientId: 1, doctorId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "CommunicationThread",
  communicationThreadSchema
);
