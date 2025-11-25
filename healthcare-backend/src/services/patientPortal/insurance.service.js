const Insurance = require("../../models/insurance.model");
const AppError = require("../../utils/appError");

/**
 * Insurance Service
 * Business logic for patient insurance management
 */

class InsuranceService {
  /**
   * Get all insurance policies
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;
    if (filters.active !== undefined) query.isActive = filters.active;

    return await Insurance.find(query).sort({ isPrimary: -1, createdAt: -1 });
  }

  /**
   * Get single insurance policy
   */
  static async getById(patientId, insuranceId) {
    const insurance = await Insurance.findOne({
      _id: insuranceId,
      patientId,
    });

    if (!insurance) {
      throw new AppError("Insurance policy not found", 404);
    }

    return insurance;
  }

  /**
   * Get primary insurance
   */
  static async getPrimary(patientId) {
    const insurance = await Insurance.findOne({
      patientId,
      isPrimary: true,
    });

    if (!insurance) {
      throw new AppError("No primary insurance found", 404);
    }

    return insurance;
  }

  /**
   * Create new insurance policy
   */
  static async create(patientId, data) {
    // Validate unique policy number
    const existing = await Insurance.findOne({
      patientId,
      policyNumber: data.policyNumber,
    });

    if (existing) {
      throw new AppError("Policy number already exists", 409);
    }

    // If no primary exists, make this primary
    const primaryExists = await Insurance.findOne({
      patientId,
      isPrimary: true,
    });

    const insurance = new Insurance({
      patientId,
      ...data,
      isPrimary: !primaryExists,
    });

    await insurance.save();
    return insurance;
  }

  /**
   * Update insurance policy
   */
  static async update(patientId, insuranceId, updateData) {
    // Check for duplicate policy number
    if (updateData.policyNumber) {
      const existing = await Insurance.findOne({
        _id: { $ne: insuranceId },
        patientId,
        policyNumber: updateData.policyNumber,
      });

      if (existing) {
        throw new AppError("Policy number already exists", 409);
      }
    }

    const insurance = await Insurance.findOneAndUpdate(
      { _id: insuranceId, patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!insurance) {
      throw new AppError("Insurance policy not found", 404);
    }

    return insurance;
  }

  /**
   * Delete insurance policy
   */
  static async delete(patientId, insuranceId) {
    const insurance = await Insurance.findOneAndDelete({
      _id: insuranceId,
      patientId,
    });

    if (!insurance) {
      throw new AppError("Insurance policy not found", 404);
    }

    // If deleted insurance was primary, set another as primary
    if (insurance.isPrimary) {
      const nextInsurance = await Insurance.findOne({
        patientId,
        _id: { $ne: insuranceId },
      });

      if (nextInsurance) {
        nextInsurance.isPrimary = true;
        await nextInsurance.save();
      }
    }

    return insurance;
  }

  /**
   * Set as primary insurance
   */
  static async setPrimary(patientId, insuranceId) {
    // Find the insurance to set as primary
    const insurance = await Insurance.findOne({
      _id: insuranceId,
      patientId,
    });

    if (!insurance) {
      throw new AppError("Insurance policy not found", 404);
    }

    // Remove primary from all others
    await Insurance.updateMany({ patientId }, { isPrimary: false });

    // Set this as primary
    insurance.isPrimary = true;
    await insurance.save();

    return insurance;
  }

  /**
   * Verify insurance status
   */
  static async verify(patientId, insuranceId) {
    const insurance = await this.getById(patientId, insuranceId);

    // Check if policy is expired
    if (insurance.expiryDate < new Date()) {
      insurance.status = "EXPIRED";
    } else if (insurance.effectiveDate > new Date()) {
      insurance.status = "NOT_ACTIVE";
    } else {
      insurance.status = "ACTIVE";
    }

    insurance.verificationStatus = "VERIFIED";
    insurance.verificationDate = new Date();

    await insurance.save();
    return insurance;
  }

  /**
   * Calculate coverage amount
   */
  static calculateCoverage(totalAmount, coveragePercent) {
    return (totalAmount * coveragePercent) / 100;
  }

  /**
   * Check coverage eligibility
   */
  static async checkEligibility(patientId) {
    const primary = await Insurance.findOne({
      patientId,
      isPrimary: true,
    });

    if (!primary) {
      return {
        eligible: false,
        reason: "No primary insurance found",
      };
    }

    const now = new Date();

    if (primary.expiryDate < now) {
      return {
        eligible: false,
        reason: "Insurance policy expired",
      };
    }

    if (primary.effectiveDate > now) {
      return {
        eligible: false,
        reason: "Insurance policy not yet effective",
      };
    }

    return {
      eligible: true,
      insuranceId: primary._id,
      coveragePercent: primary.coveragePercent,
      deductible: primary.deductible,
    };
  }

  /**
   * Get insurance summary
   */
  static async getSummary(patientId) {
    const policies = await this.getAll(patientId);

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter((p) => p.status === "ACTIVE").length,
      primaryPolicy: policies.find((p) => p.isPrimary),
      allPolicies: policies,
    };
  }
}

module.exports = InsuranceService;
