const Demographics = require("../../models/demographics.model");
const AppError = require("../../utils/appError");

/**
 * Demographics Service
 * Business logic for patient demographics
 */

class DemographicsService {
  /**
   * Get or create demographics for patient
   */
  static async getOrCreate(patientId) {
    let demographics = await Demographics.findOne({ patientId });

    if (!demographics) {
      demographics = new Demographics({ patientId });
      await demographics.save();
    }

    return demographics;
  }

  /**
   * Get demographics data
   */
  static async get(patientId) {
    const demographics = await Demographics.findOne({ patientId });

    if (!demographics) {
      throw new AppError("Demographics not found", 404);
    }

    return demographics;
  }

  /**
   * Create or update demographics
   */
  static async createOrUpdate(patientId, data) {
    // Check for duplicate identity number
    if (data.identityNumber) {
      const existing = await Demographics.findOne({
        patientId: { $ne: patientId },
        identityNumber: data.identityNumber,
      });

      if (existing) {
        throw new AppError("Identity number already exists", 409);
      }
    }

    let demographics = await Demographics.findOne({ patientId });

    if (!demographics) {
      demographics = new Demographics({ patientId, ...data });
    } else {
      Object.assign(demographics, data);
    }

    await demographics.save();
    return demographics;
  }

  /**
   * Add address
   */
  static async addAddress(patientId, addressData) {
    const demographics = await this.getOrCreate(patientId);

    demographics.addresses.push(addressData);
    await demographics.save();

    return demographics;
  }

  /**
   * Update address
   */
  static async updateAddress(patientId, addressId, updateData) {
    const demographics = await Demographics.findOne({
      patientId,
      "addresses._id": addressId,
    });

    if (!demographics) {
      throw new AppError("Address not found", 404);
    }

    const address = demographics.addresses.id(addressId);
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    Object.assign(address, updateData);
    await demographics.save();

    return demographics;
  }

  /**
   * Delete address
   */
  static async deleteAddress(patientId, addressId) {
    const demographics = await Demographics.findOne({
      patientId,
      "addresses._id": addressId,
    });

    if (!demographics) {
      throw new AppError("Address not found", 404);
    }

    demographics.addresses.id(addressId).remove();
    await demographics.save();

    return demographics;
  }

  /**
   * Get full address list
   */
  static async getAddresses(patientId) {
    const demographics = await Demographics.findOne(
      { patientId },
      { addresses: 1 }
    );

    if (!demographics) {
      return [];
    }

    return demographics.addresses;
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Validate demographics data
   */
  static validateDemographics(data) {
    const errors = [];

    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const age = this.calculateAge(dob);

      if (age < 0 || age > 150) {
        errors.push("Invalid date of birth");
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Invalid email format");
      }
    }

    if (data.phoneNumber) {
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(data.phoneNumber.replace(/\D/g, ""))) {
        errors.push("Invalid phone number");
      }
    }

    return errors;
  }
}

module.exports = DemographicsService;
