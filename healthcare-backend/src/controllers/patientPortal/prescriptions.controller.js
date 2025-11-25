const Prescription = require("../../models/prescription.model");
const Visit = require("../../models/visit.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Patient Prescriptions Controller
 * Quản lý đơn thuốc từ phía bệnh nhân
 */

class PrescriptionsController {
  /**
   * Lấy danh sách đơn thuốc
   */
  static async getMyPrescriptions(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await Prescription.countDocuments(filter);

      const prescriptions = await Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("visitId", "visitDate diagnosis")
        .populate("doctorId", "name email phone")
        .lean();

      successResponse(
        res,
        prescriptions,
        "Your prescriptions retrieved successfully",
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
   * Lấy chi tiết đơn thuốc
   */
  static async getPrescriptionDetail(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      })
        .populate("visitId", "visitDate diagnosis doctorId")
        .populate("doctorId", "name specialization email phone")
        .lean();

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      successResponse(
        res,
        prescription,
        "Prescription details retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy active prescriptions
   */
  static async getActivePrescriptions(req, res, next) {
    try {
      const { patientId } = req.user;

      const prescriptions = await Prescription.find({
        patientId,
        status: "ACTIVE",
      })
        .sort({ expiryDate: 1 })
        .populate("doctorId", "name email phone")
        .lean();

      successResponse(
        res,
        prescriptions,
        "Active prescriptions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy prescriptions sắp hết
   */
  static async getExpiringPrescriptions(req, res, next) {
    try {
      const { patientId } = req.user;
      const { days = 7 } = req.query;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days));

      const prescriptions = await Prescription.find({
        patientId,
        status: "ACTIVE",
        expiryDate: {
          $gte: new Date(),
          $lte: futureDate,
        },
      })
        .sort({ expiryDate: 1 })
        .populate("doctorId", "name email phone")
        .lean();

      successResponse(
        res,
        prescriptions,
        `Prescriptions expiring within ${days} days retrieved successfully`,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Yêu cầu refill đơn thuốc
   */
  static async requestRefill(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;
      const { reason } = req.body;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      });

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      if (!["ACTIVE", "EXPIRED"].includes(prescription.status)) {
        return next(
          new AppError("Cannot request refill for this prescription", 400)
        );
      }

      if (prescription.refillsRemaining <= 0) {
        return next(
          new AppError("No refills remaining for this prescription", 400)
        );
      }

      prescription.refillRequests.push({
        requestDate: new Date(),
        reason: reason || "Patient requested refill",
        status: "PENDING",
      });

      await prescription.save();

      successResponse(
        res,
        prescription,
        "Refill request submitted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử refill
   */
  static async getRefillHistory(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      }).select("refillRequests refillsUsed refillsRemaining");

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      const history = {
        totalRefills: prescription.refillsRemaining + prescription.refillsUsed,
        refillsUsed: prescription.refillsUsed,
        refillsRemaining: prescription.refillsRemaining,
        refillRequests: prescription.refillRequests,
      };

      successResponse(
        res,
        history,
        "Refill history retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download prescription (as PDF)
   */
  static async downloadPrescription(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      })
        .populate("doctorId", "name specialization email phone")
        .populate("visitId", "visitDate diagnosis");

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      // For now, return JSON format
      // PDF generation would require additional libraries like pdfkit or puppeteer
      successResponse(
        res,
        {
          prescription,
          format: "json",
          message: "PDF generation coming soon",
        },
        "Prescription downloaded successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy medication instructions
   */
  static async getMedicationInstructions(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      }).select(
        "medicationName dosage frequency duration specialInstructions contraindications"
      );

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      const instructions = {
        medicationName: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        specialInstructions: prescription.specialInstructions,
        contraindications: prescription.contraindications,
        takeWith: "With or without food (check label)",
        missedDose: "Take the missed dose as soon as you remember",
        overdose: "Seek medical attention immediately",
      };

      successResponse(
        res,
        instructions,
        "Medication instructions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get medication side effects
   */
  static async getMedicationSideEffects(req, res, next) {
    try {
      const { patientId } = req.user;
      const { prescriptionId } = req.params;

      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patientId,
      }).select("medicationName sideEffects");

      if (!prescription) {
        return next(new AppError("Prescription not found", 404));
      }

      successResponse(
        res,
        {
          medicationName: prescription.medicationName,
          commonSideEffects: prescription.sideEffects || [
            "Nausea",
            "Dizziness",
            "Headache",
          ],
          severeSideEffects: [
            "Severe allergic reactions",
            "Difficulty breathing",
            "Chest pain",
          ],
          whenToSeekHelp:
            "Seek immediate medical attention if you experience severe side effects",
        },
        "Medication side effects retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy medication reminders
   */
  static async getMedicationReminders(req, res, next) {
    try {
      const { patientId } = req.user;

      const prescriptions = await Prescription.find({
        patientId,
        status: "ACTIVE",
      }).select("medicationName dosage frequency startDate endDate");

      const reminders = prescriptions.map((prescription) => {
        // Generate reminder times based on frequency
        let reminderTimes = [];
        if (prescription.frequency === "ONCE_DAILY") {
          reminderTimes = ["09:00"];
        } else if (prescription.frequency === "TWICE_DAILY") {
          reminderTimes = ["09:00", "21:00"];
        } else if (prescription.frequency === "THRICE_DAILY") {
          reminderTimes = ["08:00", "14:00", "20:00"];
        } else if (prescription.frequency === "FOUR_TIMES_DAILY") {
          reminderTimes = ["08:00", "12:00", "16:00", "20:00"];
        }

        return {
          prescriptionId: prescription._id,
          medicationName: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          reminderTimes,
          status: "ACTIVE",
        };
      });

      successResponse(
        res,
        reminders,
        "Medication reminders retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get prescription statistics
   */
  static async getPrescriptionStats(req, res, next) {
    try {
      const { patientId } = req.user;

      const stats = await Prescription.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: null,
            totalPrescriptions: { $sum: 1 },
            activePrescriptions: {
              $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
            },
            expiredPrescriptions: {
              $sum: { $cond: [{ $eq: ["$status", "EXPIRED"] }, 1, 0] },
            },
            completedPrescriptions: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            totalMedicationsCount: { $sum: 1 },
          },
        },
      ]);

      successResponse(
        res,
        stats[0] || {},
        "Prescription statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PrescriptionsController;
