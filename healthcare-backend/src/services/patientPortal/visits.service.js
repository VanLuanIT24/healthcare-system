const Visit = require("../../models/visit.model");
const Prescription = require("../../models/prescription.model");
const User = require("../../models/user.model");
const AppError = require("../../utils/appError");

/**
 * Visit Service
 * Business logic for patient visit management
 */

class VisitService {
  /**
   * Get all visits with filters
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;
    if (filters.doctorId) query.doctorId = filters.doctorId;
    if (filters.departmentId) query.departmentId = filters.departmentId;

    return await Visit.find(query)
      .sort({ visitDate: -1 })
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name")
      .lean();
  }

  /**
   * Get single visit
   */
  static async getById(patientId, visitId) {
    const visit = await Visit.findOne({
      _id: visitId,
      patientId,
    })
      .populate("doctorId", "name specialization email phone")
      .populate("departmentId", "name")
      .populate("prescriptionIds");

    if (!visit) {
      throw new AppError("Visit not found", 404);
    }

    return visit;
  }

  /**
   * Get upcoming visits
   */
  static async getUpcoming(patientId, limit = 5) {
    const now = new Date();

    return await Visit.find({
      patientId,
      visitDate: { $gte: now },
      status: { $in: ["SCHEDULED", "CONFIRMED"] },
    })
      .sort({ visitDate: 1 })
      .limit(limit)
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Get past visits
   */
  static async getPast(patientId, limit = 10) {
    const now = new Date();

    return await Visit.find({
      patientId,
      visitDate: { $lt: now },
      status: "COMPLETED",
    })
      .sort({ visitDate: -1 })
      .limit(limit)
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Create visit
   */
  static async create(patientId, visitData) {
    // Validate doctor exists
    const doctor = await User.findById(visitData.doctorId);
    if (!doctor || doctor.role !== "DOCTOR") {
      throw new AppError("Invalid doctor", 404);
    }

    const visit = new Visit({
      patientId,
      ...visitData,
      status: "SCHEDULED",
    });

    await visit.save();
    await visit.populate("doctorId", "name specialization");

    return visit;
  }

  /**
   * Update visit
   */
  static async update(patientId, visitId, updateData) {
    const visit = await Visit.findOneAndUpdate(
      { _id: visitId, patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!visit) {
      throw new AppError("Visit not found", 404);
    }

    return visit;
  }

  /**
   * Complete visit
   */
  static async complete(patientId, visitId, completeData) {
    const visit = await this.getById(patientId, visitId);

    if (visit.status === "COMPLETED") {
      throw new AppError("Visit already completed", 400);
    }

    visit.status = "COMPLETED";
    visit.completionDate = new Date();
    visit.diagnosis = completeData.diagnosis;
    visit.assessment = completeData.assessment;
    visit.recommendations = completeData.recommendations;
    visit.followUpRequired = completeData.followUpRequired;

    if (completeData.vitalSigns) {
      visit.vitalSigns = completeData.vitalSigns;
    }

    await visit.save();
    return visit;
  }

  /**
   * Cancel visit
   */
  static async cancel(patientId, visitId, cancelData) {
    const visit = await this.getById(patientId, visitId);

    if (!["SCHEDULED", "CONFIRMED"].includes(visit.status)) {
      throw new AppError(
        "Cannot cancel this visit. Already completed or cancelled.",
        400
      );
    }

    visit.status = "CANCELLED";
    visit.cancellationReason = cancelData.reason;
    visit.cancellationDate = new Date();

    await visit.save();
    return visit;
  }

  /**
   * Get visits by doctor
   */
  static async getByDoctor(patientId, doctorId) {
    return await Visit.find({
      patientId,
      doctorId,
    })
      .sort({ visitDate: -1 })
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Get visits by department
   */
  static async getByDepartment(patientId, departmentId) {
    return await Visit.find({
      patientId,
      departmentId,
    })
      .sort({ visitDate: -1 })
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Get recommendations
   */
  static async getRecommendations(patientId, visitId) {
    const visit = await this.getById(patientId, visitId);

    return {
      visitId: visit._id,
      recommendations: visit.recommendations,
      followUpRequired: visit.followUpRequired,
      followUpDate: visit.followUpDate,
      referredTo: visit.referredTo,
    };
  }

  /**
   * Get visit summary
   */
  static async getSummary(patientId) {
    const visits = await Visit.find({ patientId });

    return {
      totalVisits: visits.length,
      completedVisits: visits.filter((v) => v.status === "COMPLETED").length,
      upcomingVisits: visits.filter(
        (v) => v.visitDate > new Date() && v.status !== "CANCELLED"
      ).length,
      cancelledVisits: visits.filter((v) => v.status === "CANCELLED").length,
    };
  }

  /**
   * Calculate average visit duration
   */
  static async getAverageVisitDuration(patientId) {
    const visits = await Visit.find({
      patientId,
      status: "COMPLETED",
      visitEndTime: { $exists: true },
    }).lean();

    if (visits.length === 0) return 0;

    const totalDuration = visits.reduce((sum, visit) => {
      const start = new Date(visit.visitDate);
      const end = new Date(visit.visitEndTime);
      return sum + (end - start);
    }, 0);

    return Math.round(totalDuration / visits.length / 60000); // in minutes
  }
}

module.exports = VisitService;
