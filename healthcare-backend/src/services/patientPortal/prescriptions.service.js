const Prescription = require("../../models/prescription.model");
const AppError = require("../../utils/appError");

/**
 * Prescriptions Service
 * Business logic for patient prescriptions
 */

class PrescriptionsService {
  /**
   * Get all prescriptions
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;

    return await Prescription.find(query)
      .sort({ createdAt: -1 })
      .populate("doctorId", "name email phone")
      .lean();
  }

  /**
   * Get single prescription
   */
  static async getById(patientId, prescriptionId) {
    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patientId,
    })
      .populate("doctorId", "name specialization email phone")
      .populate("visitId", "visitDate diagnosis");

    if (!prescription) {
      throw new AppError("Prescription not found", 404);
    }

    return prescription;
  }

  /**
   * Get active prescriptions
   */
  static async getActive(patientId) {
    return await Prescription.find({
      patientId,
      status: "ACTIVE",
    })
      .sort({ expiryDate: 1 })
      .populate("doctorId", "name email phone")
      .lean();
  }

  /**
   * Get expiring prescriptions
   */
  static async getExpiring(patientId, daysAhead = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Prescription.find({
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
  }

  /**
   * Request refill
   */
  static async requestRefill(patientId, prescriptionId, reason) {
    const prescription = await this.getById(patientId, prescriptionId);

    if (!["ACTIVE", "EXPIRED"].includes(prescription.status)) {
      throw new AppError("Cannot request refill for this prescription", 400);
    }

    if (prescription.refillsRemaining <= 0) {
      throw new AppError("No refills remaining", 400);
    }

    prescription.refillRequests.push({
      requestDate: new Date(),
      reason: reason || "Patient requested refill",
      status: "PENDING",
    });

    await prescription.save();
    return prescription;
  }

  /**
   * Get refill history
   */
  static async getRefillHistory(patientId, prescriptionId) {
    const prescription = await this.getById(patientId, prescriptionId);

    return {
      totalRefills: prescription.refillsRemaining + prescription.refillsUsed,
      refillsUsed: prescription.refillsUsed,
      refillsRemaining: prescription.refillsRemaining,
      refillRequests: prescription.refillRequests,
    };
  }

  /**
   * Get medication instructions
   */
  static async getMedicationInstructions(patientId, prescriptionId) {
    const prescription = await this.getById(patientId, prescriptionId);

    return {
      medicationName: prescription.medicationName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      specialInstructions: prescription.specialInstructions,
      contraindications: prescription.contraindications,
      sideEffects: prescription.sideEffects,
    };
  }

  /**
   * Get medication reminders
   */
  static async getMedicationReminders(patientId) {
    const prescriptions = await Prescription.find({
      patientId,
      status: "ACTIVE",
    }).select("medicationName dosage frequency startDate endDate");

    return prescriptions.map((prescription) => {
      let reminderTimes = [];

      switch (prescription.frequency) {
        case "ONCE_DAILY":
          reminderTimes = ["09:00"];
          break;
        case "TWICE_DAILY":
          reminderTimes = ["09:00", "21:00"];
          break;
        case "THRICE_DAILY":
          reminderTimes = ["08:00", "14:00", "20:00"];
          break;
        case "FOUR_TIMES_DAILY":
          reminderTimes = ["08:00", "12:00", "16:00", "20:00"];
          break;
        default:
          reminderTimes = [];
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
  }

  /**
   * Get prescription statistics
   */
  static async getStatistics(patientId) {
    const prescriptions = await Prescription.find({ patientId });

    return {
      totalPrescriptions: prescriptions.length,
      activePrescriptions: prescriptions.filter((p) => p.status === "ACTIVE")
        .length,
      expiredPrescriptions: prescriptions.filter((p) => p.status === "EXPIRED")
        .length,
      completedPrescriptions: prescriptions.filter(
        (p) => p.status === "COMPLETED"
      ).length,
    };
  }

  /**
   * Check medication interactions
   */
  static checkMedicationInteractions(medications) {
    // Common interactions database
    const interactions = {
      aspirin: ["warfarin", "ibuprofen"],
      warfarin: ["aspirin", "nsaids"],
      metformin: ["contrast dye"],
      lisinopril: ["potassium supplements"],
    };

    const warnings = [];

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();

        if (interactions[med1] && interactions[med1].includes(med2)) {
          warnings.push({
            severity: "HIGH",
            message: `Potential interaction between ${medications[i]} and ${medications[j]}`,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Validate prescription
   */
  static validatePrescription(data) {
    const errors = [];

    if (!data.medicationName) errors.push("Medication name is required");
    if (!data.dosage) errors.push("Dosage is required");
    if (!data.frequency) errors.push("Frequency is required");

    return errors;
  }
}

module.exports = PrescriptionsService;
