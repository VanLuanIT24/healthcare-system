const LabOrder = require("../../models/labOrder.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Patient Lab Results Controller
 * Quản lý kết quả xét nghiệm từ phía bệnh nhân
 */

class LabResultsController {
  /**
   * Lấy danh sách lab orders
   */
  static async getMyLabOrders(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await LabOrder.countDocuments(filter);

      const labOrders = await LabOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("visitId", "visitDate diagnosis")
        .populate("orderedBy", "name specialization")
        .lean();

      successResponse(
        res,
        labOrders,
        "Your lab orders retrieved successfully",
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
   * Lấy chi tiết lab result
   */
  static async getLabResultDetail(req, res, next) {
    try {
      const { patientId } = req.user;
      const { labOrderId } = req.params;

      const labOrder = await LabOrder.findOne({
        _id: labOrderId,
        patientId,
      })
        .populate("visitId", "visitDate diagnosis doctorId")
        .populate("orderedBy", "name specialization email phone")
        .lean();

      if (!labOrder) {
        return next(new AppError("Lab result not found", 404));
      }

      successResponse(
        res,
        labOrder,
        "Lab result details retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lab results sẵn sàng
   */
  static async getCompletedLabResults(req, res, next) {
    try {
      const { patientId } = req.user;
      const { reviewed = false, page = 1, limit = 10 } = req.query;

      const filter = {
        patientId,
        status: "COMPLETED",
      };

      if (reviewed === "false") {
        filter.resultReviewed = false;
      }

      const skip = (page - 1) * limit;
      const total = await LabOrder.countDocuments(filter);

      const results = await LabOrder.find(filter)
        .sort({ completedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("orderedBy", "name specialization")
        .lean();

      successResponse(
        res,
        results,
        "Completed lab results retrieved successfully",
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
   * Lấy lab results pending
   */
  static async getPendingLabResults(req, res, next) {
    try {
      const { patientId } = req.user;

      const results = await LabOrder.find({
        patientId,
        status: { $in: ["PENDING", "IN_PROGRESS"] },
      })
        .sort({ expectedDate: 1 })
        .populate("orderedBy", "name specialization")
        .lean();

      successResponse(
        res,
        results,
        "Pending lab results retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark lab result as reviewed
   */
  static async markAsReviewed(req, res, next) {
    try {
      const { patientId } = req.user;
      const { labOrderId } = req.params;

      const labOrder = await LabOrder.findOneAndUpdate(
        { _id: labOrderId, patientId },
        { resultReviewed: true, reviewedDate: new Date() },
        { new: true }
      );

      if (!labOrder) {
        return next(new AppError("Lab result not found", 404));
      }

      successResponse(res, labOrder, "Lab result marked as reviewed", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lab results theo test type
   */
  static async getLabResultsByType(req, res, next) {
    try {
      const { patientId } = req.user;
      const { testType, page = 1, limit = 10 } = req.query;

      const filter = {
        patientId,
        testType,
      };

      const skip = (page - 1) * limit;
      const total = await LabOrder.countDocuments(filter);

      const results = await LabOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(res, results, "Lab results retrieved successfully", 200, {
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
   * Download lab result report
   */
  static async downloadLabReport(req, res, next) {
    try {
      const { patientId } = req.user;
      const { labOrderId } = req.params;
      const { format = "json" } = req.query;

      const labOrder = await LabOrder.findOne({
        _id: labOrderId,
        patientId,
        status: "COMPLETED",
      })
        .populate("orderedBy", "name specialization")
        .populate("visitId", "visitDate");

      if (!labOrder) {
        return next(new AppError("Lab result not found or not completed", 404));
      }

      // For now, return JSON format
      // PDF generation would require additional libraries
      if (format === "json") {
        successResponse(
          res,
          labOrder,
          "Lab report downloaded successfully",
          200
        );
      } else {
        return next(new AppError("Download format not supported yet", 400));
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get normal range reference
   */
  static async getNormalRangeReference(req, res, next) {
    try {
      const { testType } = req.query;

      // Standard lab test reference ranges
      const referenceRanges = {
        BLOOD_TEST: {
          hemoglobin: { min: 12, max: 16, unit: "g/dL" },
          whiteBloodCells: { min: 4.5, max: 11, unit: "K/uL" },
          platelets: { min: 150, max: 400, unit: "K/uL" },
          hematocrit: { min: 36, max: 46, unit: "%" },
        },
        URINE_TEST: {
          glucose: { status: "Negative", unit: "presence" },
          protein: { status: "Negative", unit: "presence" },
          ph: { min: 4.5, max: 8, unit: "pH" },
        },
        CHOLESTEROL: {
          total: { min: 0, max: 200, unit: "mg/dL" },
          ldl: { min: 0, max: 100, unit: "mg/dL" },
          hdl: { min: 40, max: 300, unit: "mg/dL" },
          triglycerides: { min: 0, max: 150, unit: "mg/dL" },
        },
        GLUCOSE: {
          fasting: { min: 70, max: 100, unit: "mg/dL" },
          random: { min: 0, max: 140, unit: "mg/dL" },
        },
      };

      const range = testType ? referenceRanges[testType] : referenceRanges;

      successResponse(
        res,
        range,
        "Normal range reference retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lab result interpretation
   */
  static async getLabResultInterpretation(req, res, next) {
    try {
      const { patientId } = req.user;
      const { labOrderId } = req.params;

      const labOrder = await LabOrder.findOne({
        _id: labOrderId,
        patientId,
        status: "COMPLETED",
      }).select("testName testResult normalRange interpretation");

      if (!labOrder) {
        return next(new AppError("Lab result not found", 404));
      }

      const interpretation = {
        testName: labOrder.testName,
        result: labOrder.testResult,
        normalRange: labOrder.normalRange,
        status: labOrder.interpretation || "NORMAL",
        meaning:
          labOrder.interpretation === "HIGH"
            ? "Your result is higher than the normal range"
            : labOrder.interpretation === "LOW"
            ? "Your result is lower than the normal range"
            : "Your result is within the normal range",
        recommendation: labOrder.interpretation
          ? "Please consult your doctor for more details"
          : "Your result is normal",
      };

      successResponse(
        res,
        interpretation,
        "Lab result interpretation retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lab statistics
   */
  static async getLabStatistics(req, res, next) {
    try {
      const { patientId } = req.user;

      const stats = await LabOrder.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            completedTests: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            pendingTests: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
            },
            inProgressTests: {
              $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
            },
            cancelledTests: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
          },
        },
      ]);

      successResponse(
        res,
        stats[0] || {},
        "Lab statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add lab result note
   */
  static async addLabResultNote(req, res, next) {
    try {
      const { patientId } = req.user;
      const { labOrderId } = req.params;
      const { note } = req.body;

      const labOrder = await LabOrder.findOneAndUpdate(
        { _id: labOrderId, patientId },
        {
          $push: {
            patientNotes: {
              note,
              date: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!labOrder) {
        return next(new AppError("Lab result not found", 404));
      }

      successResponse(res, labOrder, "Note added successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LabResultsController;
