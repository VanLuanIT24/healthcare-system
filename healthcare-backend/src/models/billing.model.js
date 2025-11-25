const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    billDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    // Related Entities
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
    },

    departmentName: String,

    doctorName: String,

    // Bill Items
    items: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        description: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        category: {
          type: String,
          enum: [
            "CONSULTATION",
            "LAB_TEST",
            "IMAGING",
            "PROCEDURE",
            "MEDICATION",
            "HOSPITAL_CHARGES",
            "OTHER",
          ],
          required: true,
        },
        serviceDate: Date,
        notes: String,
      },
    ],

    // Calculations
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discountType: {
      type: String,
      enum: ["NONE", "PERCENTAGE", "FIXED_AMOUNT"],
      default: "NONE",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountReason: String,

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Insurance
    insuranceClaimId: String,

    insuranceProvider: String,

    insuranceCoverage: {
      type: Number,
      default: 0,
      min: 0,
    },

    insuranceStatus: {
      type: String,
      enum: [
        "NOT_SUBMITTED",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "PARTIAL_APPROVAL",
        "UNDER_REVIEW",
      ],
      default: "NOT_SUBMITTED",
      index: true,
    },

    insuranceCoveragePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    insuranceNotes: String,

    // Patient Responsibility
    patientResponsibility: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "PARTIAL",
        "OVERDUE",
        "CANCELLED",
        "REFUND_PENDING",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "INSURANCE",
        "BANK_TRANSFER",
        "CHECK",
        "OTHER",
      ],
      enum: ["UNPAID", "PAID", "PARTIAL_PAYMENT"],
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "INSURANCE",
        "BANK_TRANSFER",
        "CHECK",
        "E_WALLET",
        "OTHER",
      ],
    },

    payments: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        paymentDate: Date,
        amountPaid: {
          type: Number,
          min: 0,
        },
        paymentMethod: String,
        referenceNumber: String,
        notes: String,
        receiptUrl: String,
      },
    ],

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    amountDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastPaymentDate: Date,

    // Refunds
    refundRequested: Boolean,

    refundAmount: Number,

    refundReason: String,

    refundStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED"],
      default: "PENDING",
    },

    refundDate: Date,

    // Late Payment
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },

    daysOverdue: Number,

    remindersSent: {
      type: Number,
      default: 0,
    },

    lastReminderDate: Date,

    // Notes & Documents
    notes: String,

    invoiceUrl: String,

    receiptUrl: String,

    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "CANCELLED"],
      default: "ISSUED",
    },
  },
  {
    timestamps: true,
    collection: "billing",
  }
);

// Calculate amounts before saving
billingSchema.pre("save", function (next) {
  // Calculate subtotal
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  }

  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;

  // Calculate discount amount
  if (this.discountType === "PERCENTAGE") {
    this.discountAmount = (this.subtotal * this.discountValue) / 100;
  } else if (this.discountType === "FIXED_AMOUNT") {
    this.discountAmount = this.discountValue;
  }

  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;

  // Set insurance coverage
  if (this.insuranceCoveragePercentage > 0) {
    this.insuranceCoverage =
      (this.totalAmount * this.insuranceCoveragePercentage) / 100;
  }

  // Calculate patient responsibility
  this.patientResponsibility = this.totalAmount - this.insuranceCoverage;

  // Calculate amount due
  this.amountDue = Math.max(0, this.totalAmount - this.amountPaid);

  // Check if overdue
  if (this.dueDate && new Date() > this.dueDate && this.amountDue > 0) {
    this.isOverdue = true;
    this.daysOverdue = Math.floor(
      (new Date() - this.dueDate) / (1000 * 60 * 60 * 24)
    );
  }

  // Determine payment status
  if (this.amountPaid === 0) {
    this.paymentStatus = "PENDING";
  } else if (this.amountPaid < this.totalAmount) {
    this.paymentStatus = "PARTIAL";
  } else if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = "PAID";
  }

  next();
});

// Indexes
billingSchema.index({ patientId: 1, billDate: -1 });
billingSchema.index({ patientId: 1, paymentStatus: 1 });
billingSchema.index({ billNumber: 1 });
billingSchema.index({ visitId: 1 });
billingSchema.index({ patientId: 1, isOverdue: 1 });

module.exports = mongoose.model("Billing", billingSchema);
