const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    // Participants
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    doctorName: String,

    // Thread Info (for grouping conversations)
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunicationThread",
      index: true,
    },

    threadSubject: String,

    // Message Type
    messageType: {
      type: String,
      enum: [
        "CHAT",
        "NOTIFICATION",
        "ALERT",
        "PRESCRIPTION_UPDATE",
        "APPOINTMENT_REMINDER",
        "LAB_RESULT",
        "DISCHARGE_SUMMARY",
        "OTHER",
      ],
      required: true,
      index: true,
    },

    // Sender Info
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["DOCTOR", "PATIENT", "NURSE", "ADMIN", "SYSTEM"],
        required: true,
      },
      avatar: String,
    },

    // Recipient Info
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: String,
    },

    // Message Content
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: Date,
      },
    ],

    // Reply Chain
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
    },

    replyCount: {
      type: Number,
      default: 0,
    },

    // Read Status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: Date,

    // Priority (for alerts and notifications)
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
      index: true,
    },

    // Notification Type
    notificationType: {
      type: String,
      enum: [
        "APPOINTMENT_REMINDER",
        "APPOINTMENT_CONFIRMED",
        "APPOINTMENT_CANCELLED",
        "APPOINTMENT_RESCHEDULED",
        "PRESCRIPTION_READY",
        "PRESCRIPTION_REFILL",
        "LAB_RESULT_AVAILABLE",
        "LAB_RESULT_ABNORMAL",
        "VISIT_SUMMARY",
        "DISCHARGE_SUMMARY",
        "MEDICATION_REMINDER",
        "VACCINATION_DUE",
        "INSURANCE_UPDATE",
        "BILL_AVAILABLE",
        "PAYMENT_REMINDER",
        "DOCTOR_MESSAGE",
        "GENERAL_NOTIFICATION",
      ],
    },

    // Related Entity (if it's a notification about something specific)
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
          "INSURANCE",
        ],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },

    // Action Button (if notification has an action)
    actionButton: {
      label: String,
      action: String,
      url: String,
    },

    // Template (for system-generated messages)
    templateName: String,
    templateVariables: mongoose.Schema.Types.Mixed,

    // Archiving
    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: Date,

    // Flags
    isSpam: {
      type: Boolean,
      default: false,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagReason: String,

    // Scheduling (for sending later)
    scheduledSendTime: Date,

    isSent: {
      type: Boolean,
      default: true,
    },

    // Delivery Status
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "DELIVERED", "FAILED", "BOUNCED"],
      default: "DELIVERED",
    },

    deliveryAttempts: {
      type: Number,
      default: 1,
    },

    lastDeliveryAttempt: Date,

    // Encryption
    isEncrypted: {
      type: Boolean,
      default: false,
    },

    // Reactions (emoji reactions)
    reactions: [
      {
        emoji: String,
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        createdAt: Date,
      },
    ],

    // Delete Status
    deletedBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        deletedAt: Date,
      },
    ],

    // Tracking
    editedAt: Date,
    editedBy: mongoose.Schema.Types.ObjectId,
    editHistory: [
      {
        originalContent: String,
        editedAt: Date,
        editedBy: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
    collection: "communications",
  }
);

// Indexes
communicationSchema.index({ patientId: 1, createdAt: -1 });
communicationSchema.index({ threadId: 1, createdAt: -1 });
communicationSchema.index({ patientId: 1, read: 1 });
communicationSchema.index({ "sender.userId": 1, createdAt: -1 });
communicationSchema.index({ messageType: 1, priority: 1 });

// Virtual for formatted sender name with role
communicationSchema.virtual("senderDisplay").get(function () {
  return `${this.sender.name} (${this.sender.role})`;
});

module.exports = mongoose.model("Communication", communicationSchema);
