const Billing = require("../../models/billing.model");
const Insurance = require("../../models/insurance.model");
const AppError = require("../../utils/appError");

/**
 * Billing Service
 * Business logic for patient billing and payments
 */

class BillingService {
  /**
   * Get all billings
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

    return await Billing.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get single billing
   */
  static async getById(patientId, billingId) {
    const billing = await Billing.findOne({
      _id: billingId,
      patientId,
    });

    if (!billing) {
      throw new AppError("Billing record not found", 404);
    }

    return billing;
  }

  /**
   * Create billing
   */
  static async create(patientId, billingData) {
    const {
      services = [],
      medications = [],
      procedures = [],
      labTests = [],
      operationCharges,
      roomCharges,
      discountPercent = 0,
    } = billingData;

    // Calculate totals
    let subtotal = 0;

    const serviceTotal = services.reduce(
      (sum, service) => sum + service.quantity * service.unitPrice,
      0
    );
    subtotal += serviceTotal;

    const medicationTotal = medications.reduce(
      (sum, med) => sum + med.quantity * med.unitPrice,
      0
    );
    subtotal += medicationTotal;

    const procedureTotal = procedures.reduce(
      (sum, proc) => sum + proc.quantity * proc.unitPrice,
      0
    );
    subtotal += procedureTotal;

    const labTotal = labTests.reduce(
      (sum, lab) => sum + lab.quantity * lab.unitPrice,
      0
    );
    subtotal += labTotal;

    if (operationCharges) subtotal += operationCharges.totalCost;
    if (roomCharges) subtotal += roomCharges.totalCost;

    const discountAmount = (subtotal * discountPercent) / 100;
    const amountAfterDiscount = subtotal - discountAmount;

    // Get insurance coverage
    const insurance = await Insurance.findOne({
      patientId,
      isPrimary: true,
    });

    const insuranceCoverage = insurance
      ? (amountAfterDiscount * insurance.coveragePercent) / 100
      : 0;

    const patientResponsible = amountAfterDiscount - insuranceCoverage;

    const billing = new Billing({
      patientId,
      ...billingData,
      subtotal,
      discountAmount,
      amountAfterDiscount,
      insuranceCoverage,
      patientResponsible,
      totalAmount: patientResponsible,
      status: "PENDING",
      paymentStatus: "UNPAID",
    });

    await billing.save();
    return billing;
  }

  /**
   * Process payment
   */
  static async processPayment(patientId, billingId, paymentData) {
    const billing = await this.getById(patientId, billingId);

    if (billing.paymentStatus === "PAID") {
      throw new AppError("This billing has already been paid", 400);
    }

    const payment = {
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference,
      paymentDate: new Date(),
      status: "COMPLETED",
    };

    billing.payments.push(payment);

    // Calculate total paid
    const totalPaid = billing.payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= billing.totalAmount) {
      billing.paymentStatus = "PAID";
      billing.paidDate = new Date();
    } else if (totalPaid > 0) {
      billing.paymentStatus = "PARTIALLY_PAID";
    }

    await billing.save();
    return billing;
  }

  /**
   * Process refund
   */
  static async processRefund(patientId, billingId, refundData) {
    const billing = await this.getById(patientId, billingId);

    if (billing.paymentStatus === "UNPAID") {
      throw new AppError("Cannot refund an unpaid billing", 400);
    }

    const refund = {
      amount: refundData.amount,
      reason: refundData.reason,
      relatedPaymentId: refundData.originalPaymentId,
      refundDate: new Date(),
      status: "COMPLETED",
    };

    billing.refunds.push(refund);

    // Update payment status
    const totalPaid = billing.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = billing.refunds.reduce((sum, r) => sum + r.amount, 0);
    const netAmount = totalPaid - totalRefunded;

    if (netAmount <= 0) {
      billing.paymentStatus = "REFUNDED";
    } else if (netAmount < billing.totalAmount) {
      billing.paymentStatus = "PARTIALLY_PAID";
    }

    await billing.save();
    return billing;
  }

  /**
   * Get overdue billings
   */
  static async getOverdue(patientId, daysOverdue = 30) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysOverdue);

    return await Billing.find({
      patientId,
      paymentStatus: { $in: ["UNPAID", "PARTIALLY_PAID"] },
      dueDate: { $lt: dueDate },
    })
      .sort({ dueDate: 1 })
      .lean();
  }

  /**
   * Get billing statistics
   */
  static async getStatistics(patientId) {
    const billings = await Billing.find({ patientId });

    const paidAmount = billings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const unpaidAmount = billings
      .filter((b) => b.paymentStatus === "UNPAID")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const partiallyPaidAmount = billings
      .filter((b) => b.paymentStatus === "PARTIALLY_PAID")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      totalBillings: billings.length,
      totalAmount: billings.reduce((sum, b) => sum + b.totalAmount, 0),
      paidBillings: billings.filter((b) => b.paymentStatus === "PAID").length,
      unpaidBillings: billings.filter((b) => b.paymentStatus === "UNPAID")
        .length,
      paidAmount,
      unpaidAmount,
      partiallyPaidAmount,
    };
  }

  /**
   * Generate invoice
   */
  static async generateInvoice(patientId, billingId) {
    const billing = await this.getById(patientId, billingId);

    return {
      invoiceNumber: billing._id,
      date: new Date(),
      patient: { id: patientId },
      items: [
        ...billing.services,
        ...billing.medications,
        ...billing.procedures,
        ...billing.labTests,
      ],
      subtotal: billing.subtotal,
      discount: billing.discountAmount,
      insurance: billing.insuranceCoverage,
      totalDue: billing.totalAmount,
      paymentStatus: billing.paymentStatus,
    };
  }

  /**
   * Calculate insurance claim
   */
  static calculateInsuranceClaim(totalAmount, coveragePercent) {
    return (totalAmount * coveragePercent) / 100;
  }

  /**
   * Update billing status
   */
  static async updateStatus(patientId, billingId, status) {
    const billing = await Billing.findOneAndUpdate(
      { _id: billingId, patientId },
      { status },
      { new: true }
    );

    if (!billing) {
      throw new AppError("Billing record not found", 404);
    }

    return billing;
  }
}

module.exports = BillingService;
