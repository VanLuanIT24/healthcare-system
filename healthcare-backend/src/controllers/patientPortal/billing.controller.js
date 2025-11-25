const Billing = require("../../models/billing.model");
const Visit = require("../../models/visit.model");
const Appointment = require("../../models/appointment.model");
const Admission = require("../../models/admission.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Billing Controller
 * Quản lý hóa đơn, thanh toán và bảo hiểm
 */

class BillingController {
  /**
   * Lấy danh sách tất cả hóa đơn
   */
  static async getBillings(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, paymentStatus, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const skip = (page - 1) * limit;
      const total = await Billing.countDocuments(filter);

      const billings = await Billing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate(
          "relatedVisit relatedAppointment relatedAdmission",
          "visitDate appointmentDate admissionDate"
        )
        .lean();

      successResponse(res, billings, "Billings retrieved successfully", 200, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết hóa đơn
   */
  static async getBilling(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;

      const billing = await Billing.findOne({
        _id: billingId,
        patientId,
      })
        .populate("relatedVisit relatedAppointment relatedAdmission")
        .populate("insuranceClaim.claimId");

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      successResponse(res, billing, "Billing retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo hóa đơn mới
   */
  static async createBilling(req, res, next) {
    try {
      const { patientId } = req.user;
      const {
        billingType,
        relatedVisit,
        relatedAppointment,
        relatedAdmission,
        services = [],
        medications = [],
        procedures = [],
        labTests = [],
        operationCharges,
        roomCharges,
        discountPercent = 0,
        discountReason,
      } = req.body;

      // Calculate totals
      let subtotal = 0;

      // Services total
      const serviceTotal = services.reduce(
        (sum, service) => sum + service.quantity * service.unitPrice,
        0
      );
      subtotal += serviceTotal;

      // Medications total
      const medicationTotal = medications.reduce(
        (sum, med) => sum + med.quantity * med.unitPrice,
        0
      );
      subtotal += medicationTotal;

      // Procedures total
      const procedureTotal = procedures.reduce(
        (sum, proc) => sum + proc.quantity * proc.unitPrice,
        0
      );
      subtotal += procedureTotal;

      // Lab tests total
      const labTotal = labTests.reduce(
        (sum, lab) => sum + lab.quantity * lab.unitPrice,
        0
      );
      subtotal += labTotal;

      // Operation charges
      if (operationCharges) subtotal += operationCharges.totalCost;

      // Room charges
      if (roomCharges) subtotal += roomCharges.totalCost;

      // Calculate discount
      const discountAmount = (subtotal * discountPercent) / 100;
      const amountAfterDiscount = subtotal - discountAmount;

      // For now, assume 20% insurance coverage
      const insuranceCoverage = (amountAfterDiscount * 20) / 100;
      const patientResponsible = amountAfterDiscount - insuranceCoverage;

      const billing = new Billing({
        patientId,
        billingType,
        relatedVisit,
        relatedAppointment,
        relatedAdmission,
        services,
        medications,
        procedures,
        labTests,
        operationCharges,
        roomCharges,
        subtotal,
        discountPercent,
        discountAmount,
        discountReason,
        amountAfterDiscount,
        insuranceCoverage,
        patientResponsible,
        totalAmount: patientResponsible,
        status: "PENDING",
        paymentStatus: "UNPAID",
      });

      await billing.save();

      successResponse(res, billing, "Billing created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật hóa đơn
   */
  static async updateBilling(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;
      const updateData = req.body;

      // Don't allow updating if already paid
      const billing = await Billing.findOne({
        _id: billingId,
        patientId,
      });

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      if (billing.paymentStatus === "PAID") {
        return next(new AppError("Cannot update a paid billing record", 400));
      }

      // Recalculate totals if services changed
      if (
        updateData.services ||
        updateData.medications ||
        updateData.procedures
      ) {
        let subtotal = 0;

        const serviceTotal = (updateData.services || billing.services).reduce(
          (sum, service) => sum + service.quantity * service.unitPrice,
          0
        );
        subtotal += serviceTotal;

        const medicationTotal = (
          updateData.medications || billing.medications
        ).reduce((sum, med) => sum + med.quantity * med.unitPrice, 0);
        subtotal += medicationTotal;

        const procedureTotal = (
          updateData.procedures || billing.procedures
        ).reduce((sum, proc) => sum + proc.quantity * proc.unitPrice, 0);
        subtotal += procedureTotal;

        updateData.subtotal = subtotal;
        updateData.discountAmount =
          (subtotal * (updateData.discountPercent || billing.discountPercent)) /
          100;
        updateData.amountAfterDiscount = subtotal - updateData.discountAmount;
        updateData.insuranceCoverage =
          (updateData.amountAfterDiscount * 20) / 100;
        updateData.patientResponsible =
          updateData.amountAfterDiscount - updateData.insuranceCoverage;
        updateData.totalAmount = updateData.patientResponsible;
      }

      const updatedBilling = await Billing.findByIdAndUpdate(
        billingId,
        updateData,
        { new: true, runValidators: true }
      );

      successResponse(res, updatedBilling, "Billing updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa hóa đơn
   */
  static async deleteBilling(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;

      const billing = await Billing.findOneAndDelete({
        _id: billingId,
        patientId,
        paymentStatus: "UNPAID",
      });

      if (!billing) {
        return next(
          new AppError("Billing record not found or cannot be deleted", 404)
        );
      }

      successResponse(res, null, "Billing deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm phương thức thanh toán
   */
  static async addPaymentMethod(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;
      const { cardNumber, cardholderName, expiryDate, cvv, paymentType } =
        req.body;

      const billing = await Billing.findOneAndUpdate(
        { _id: billingId, patientId },
        {
          $push: {
            paymentMethods: {
              type: paymentType,
              cardNumber: cardNumber.slice(-4).padStart(cardNumber.length, "*"),
              cardholderName,
              expiryDate,
            },
          },
        },
        { new: true }
      );

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      successResponse(res, billing, "Payment method added successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xử lý thanh toán
   */
  static async processPayment(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;
      const { amount, paymentMethod, transactionReference } = req.body;

      const billing = await Billing.findOne({
        _id: billingId,
        patientId,
      });

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      if (billing.paymentStatus === "PAID") {
        return next(new AppError("This billing has already been paid", 400));
      }

      // Create payment record
      const payment = {
        amount,
        paymentMethod,
        transactionReference,
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

      successResponse(res, billing, "Payment processed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xử lý hoàn tiền
   */
  static async processRefund(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId } = req.params;
      const { refundAmount, refundReason, originalPaymentId } = req.body;

      const billing = await Billing.findOne({
        _id: billingId,
        patientId,
      });

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      if (billing.paymentStatus === "UNPAID") {
        return next(new AppError("Cannot refund an unpaid billing", 400));
      }

      const refund = {
        amount: refundAmount,
        reason: refundReason,
        relatedPaymentId: originalPaymentId,
        refundDate: new Date(),
        status: "COMPLETED",
      };

      billing.refunds.push(refund);

      // Update payment status if needed
      const totalPaid = billing.payments.reduce((sum, p) => sum + p.amount, 0);
      const totalRefunded = billing.refunds.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      const netAmount = totalPaid - totalRefunded;

      if (netAmount <= 0) {
        billing.paymentStatus = "REFUNDED";
      } else if (netAmount < billing.totalAmount) {
        billing.paymentStatus = "PARTIALLY_PAID";
      }

      await billing.save();

      successResponse(res, billing, "Refund processed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách thanh toán chưa sử dụng
   */
  static async getOverdueBillings(req, res, next) {
    try {
      const { patientId } = req.user;
      const { days = 30, page = 1, limit = 10 } = req.query;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - days);

      const skip = (page - 1) * limit;

      const filter = {
        patientId,
        paymentStatus: { $in: ["UNPAID", "PARTIALLY_PAID"] },
        dueDate: { $lt: dueDate },
      };

      const total = await Billing.countDocuments(filter);

      const billings = await Billing.find(filter)
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        billings,
        "Overdue billings retrieved successfully",
        200,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê hóa đơn
   */
  static async getBillingStats(req, res, next) {
    try {
      const { patientId } = req.user;

      const stats = await Billing.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: null,
            totalBillings: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalAmount", 0],
              },
            },
            totalUnpaid: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "UNPAID"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
            totalPartiallyPaid: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "PARTIALLY_PAID"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
      ]);

      successResponse(
        res,
        stats[0] || {},
        "Billing statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất hóa đơn (PDF/CSV)
   */
  static async exportBilling(req, res, next) {
    try {
      const { patientId } = req.user;
      const { billingId, format = "json" } = req.params;

      const billing = await Billing.findOne({
        _id: billingId,
        patientId,
      }).populate("relatedVisit relatedAppointment relatedAdmission");

      if (!billing) {
        return next(new AppError("Billing record not found", 404));
      }

      // For now, return JSON format
      // PDF/CSV generation would require additional libraries
      if (format === "json") {
        successResponse(res, billing, "Billing exported successfully", 200);
      } else {
        return next(new AppError("Export format not supported yet", 400));
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BillingController;
