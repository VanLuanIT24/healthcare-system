const Admission = require("../../models/admission.model");
const AppError = require("../../utils/appError");

/**
 * Admission Service
 * Business logic for hospital admission management
 */

class AdmissionService {
  /**
   * Get all admissions
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;

    return await Admission.find(query)
      .sort({ admissionDate: -1 })
      .populate("departmentId", "name")
      .populate("doctorId", "name specialization");
  }

  /**
   * Get single admission
   */
  static async getById(patientId, admissionId) {
    const admission = await Admission.findOne({
      _id: admissionId,
      patientId,
    })
      .populate("departmentId", "name")
      .populate("doctorId", "name specialization email")
      .populate("attendingPhysician", "name specialization");

    if (!admission) {
      throw new AppError("Admission not found", 404);
    }

    return admission;
  }

  /**
   * Get current active admission
   */
  static async getCurrent(patientId) {
    const admission = await Admission.findOne({
      patientId,
      status: "ACTIVE",
    })
      .populate("departmentId", "name")
      .populate("doctorId", "name specialization")
      .populate("attendingPhysician", "name specialization");

    return admission;
  }

  /**
   * Get active admissions
   */
  static async getActive(patientId) {
    return await Admission.find({
      patientId,
      status: "ACTIVE",
    })
      .populate("departmentId", "name")
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Get discharged admissions
   */
  static async getDischarged(patientId) {
    return await Admission.find({
      patientId,
      status: "DISCHARGED",
    })
      .sort({ dischargeDate: -1 })
      .populate("departmentId", "name")
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Create admission
   */
  static async create(patientId, admissionData) {
    const admission = new Admission({
      patientId,
      ...admissionData,
      status: "ACTIVE",
    });

    await admission.save();
    await admission.populate("departmentId", "name");

    return admission;
  }

  /**
   * Update admission
   */
  static async update(patientId, admissionId, updateData) {
    const admission = await Admission.findOneAndUpdate(
      { _id: admissionId, patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!admission) {
      throw new AppError("Admission not found", 404);
    }

    return admission;
  }

  /**
   * Process discharge
   */
  static async discharge(patientId, admissionId, dischargeData) {
    const admission = await this.getById(patientId, admissionId);

    if (admission.status !== "ACTIVE") {
      throw new AppError("This admission is not active", 400);
    }

    admission.status = "DISCHARGED";
    admission.dischargeDate = new Date();
    admission.dischargeSummary = dischargeData.summary;
    admission.dischargeInstructions = dischargeData.instructions;
    admission.medications = dischargeData.medications;
    admission.followUpAppointment = dischargeData.followUpAppointment;

    // Calculate length of stay
    const los = Math.ceil(
      (admission.dischargeDate - admission.admissionDate) /
        (1000 * 60 * 60 * 24)
    );
    admission.lengthOfStay = los;

    await admission.save();
    return admission;
  }

  /**
   * Get discharge summary
   */
  static async getDischargeSummary(patientId, admissionId) {
    const admission = await this.getById(patientId, admissionId);

    if (admission.status !== "DISCHARGED") {
      throw new AppError("This admission has not been discharged", 400);
    }

    return {
      admissionId: admission._id,
      admissionDate: admission.admissionDate,
      dischargeDate: admission.dischargeDate,
      lengthOfStay: admission.lengthOfStay,
      department: admission.departmentId,
      doctor: admission.doctorId,
      primaryDiagnosis: admission.primaryDiagnosis,
      secondaryDiagnoses: admission.secondaryDiagnoses,
      procedures: admission.procedures,
      investigations: admission.investigations,
      dischargeSummary: admission.dischargeSummary,
      dischargeInstructions: admission.dischargeInstructions,
      medications: admission.medications,
      followUpAppointment: admission.followUpAppointment,
    };
  }

  /**
   * Get procedures
   */
  static async getProcedures(patientId, admissionId) {
    const admission = await this.getById(patientId, admissionId);

    return admission.procedures || [];
  }

  /**
   * Get investigations
   */
  static async getInvestigations(patientId, admissionId) {
    const admission = await this.getById(patientId, admissionId);

    return admission.investigations || [];
  }

  /**
   * Calculate length of stay
   */
  static calculateLengthOfStay(admissionDate, dischargeDate) {
    return Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get admission statistics
   */
  static async getStatistics(patientId) {
    const admissions = await Admission.find({ patientId });

    const active = admissions.filter((a) => a.status === "ACTIVE").length;
    const discharged = admissions.filter(
      (a) => a.status === "DISCHARGED"
    ).length;

    const avgLos =
      discharged > 0
        ? admissions.reduce((sum, a) => sum + (a.lengthOfStay || 0), 0) /
          discharged
        : 0;

    return {
      totalAdmissions: admissions.length,
      activeAdmissions: active,
      dischargedAdmissions: discharged,
      averageLengthOfStay: Math.round(avgLos * 10) / 10,
    };
  }
}

module.exports = AdmissionService;
