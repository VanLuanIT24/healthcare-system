const LabOrder = require("../../models/labOrder.model");
const AppError = require("../../utils/appError");

/**
 * Lab Results Service
 * Business logic for patient lab results
 */

class LabResultsService {
  /**
   * Get all lab orders
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;

    return await LabOrder.find(query)
      .sort({ createdAt: -1 })
      .populate("orderedBy", "name specialization")
      .lean();
  }

  /**
   * Get single lab result
   */
  static async getById(patientId, labOrderId) {
    const labOrder = await LabOrder.findOne({
      _id: labOrderId,
      patientId,
    })
      .populate("orderedBy", "name specialization email phone")
      .populate("visitId", "visitDate diagnosis");

    if (!labOrder) {
      throw new AppError("Lab result not found", 404);
    }

    return labOrder;
  }

  /**
   * Get completed lab results
   */
  static async getCompleted(patientId, onlyUnreviewed = false) {
    const query = {
      patientId,
      status: "COMPLETED",
    };

    if (onlyUnreviewed) query.resultReviewed = false;

    return await LabOrder.find(query)
      .sort({ completedDate: -1 })
      .populate("orderedBy", "name specialization")
      .lean();
  }

  /**
   * Get pending lab results
   */
  static async getPending(patientId) {
    return await LabOrder.find({
      patientId,
      status: { $in: ["PENDING", "IN_PROGRESS"] },
    })
      .sort({ expectedDate: 1 })
      .populate("orderedBy", "name specialization")
      .lean();
  }

  /**
   * Mark as reviewed
   */
  static async markAsReviewed(patientId, labOrderId) {
    const labOrder = await LabOrder.findOneAndUpdate(
      { _id: labOrderId, patientId },
      {
        resultReviewed: true,
        reviewedDate: new Date(),
      },
      { new: true }
    );

    if (!labOrder) {
      throw new AppError("Lab result not found", 404);
    }

    return labOrder;
  }

  /**
   * Get by test type
   */
  static async getByTestType(patientId, testType) {
    return await LabOrder.find({
      patientId,
      testType,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get result interpretation
   */
  static async getInterpretation(patientId, labOrderId) {
    const labOrder = await this.getById(patientId, labOrderId);

    if (labOrder.status !== "COMPLETED") {
      throw new AppError("Lab result not completed", 400);
    }

    return {
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
  }

  /**
   * Get lab statistics
   */
  static async getStatistics(patientId) {
    const labOrders = await LabOrder.find({ patientId });

    return {
      totalTests: labOrders.length,
      completedTests: labOrders.filter((l) => l.status === "COMPLETED").length,
      pendingTests: labOrders.filter((l) => l.status === "PENDING").length,
      inProgressTests: labOrders.filter((l) => l.status === "IN_PROGRESS")
        .length,
      cancelledTests: labOrders.filter((l) => l.status === "CANCELLED").length,
    };
  }

  /**
   * Add lab result note
   */
  static async addNote(patientId, labOrderId, note) {
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
      throw new AppError("Lab result not found", 404);
    }

    return labOrder;
  }

  /**
   * Get normal range reference
   */
  static getNormalRangeReference(testType) {
    const references = {
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

    return testType ? references[testType] : references;
  }

  /**
   * Compare results over time
   */
  static async compareResults(patientId, testType, numResults = 5) {
    const results = await LabOrder.find({
      patientId,
      testType,
      status: "COMPLETED",
    })
      .sort({ completedDate: -1 })
      .limit(numResults)
      .select("testResult completedDate interpretation")
      .lean();

    return {
      testType,
      results,
      trend: this.calculateTrend(results),
    };
  }

  /**
   * Calculate trend
   */
  static calculateTrend(results) {
    if (results.length < 2) return "INSUFFICIENT_DATA";

    const latest = results[0].testResult;
    const oldest = results[results.length - 1].testResult;

    if (latest > oldest) return "INCREASING";
    if (latest < oldest) return "DECREASING";
    return "STABLE";
  }

  /**
   * Export lab report
   */
  static async exportReport(patientId, labOrderId, format = "json") {
    const labOrder = await this.getById(patientId, labOrderId);

    if (format === "json") {
      return labOrder;
    } else if (format === "pdf") {
      // PDF generation would require additional libraries
      throw new AppError("PDF export coming soon", 400);
    } else {
      throw new AppError("Unsupported format", 400);
    }
  }
}

module.exports = LabResultsService;
