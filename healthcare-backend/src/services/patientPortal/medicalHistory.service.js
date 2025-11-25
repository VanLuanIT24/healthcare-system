const MedicalRecord = require("../../models/medicalRecord.model");
const Visit = require("../../models/visit.model");
const AppError = require("../../utils/appError");

/**
 * Medical History Service
 * Business logic for patient medical history
 */

class MedicalHistoryService {
  /**
   * Get complete medical history
   */
  static async getComplete(patientId) {
    const medicalRecord = await MedicalRecord.findOne({ patientId })
      .populate("personalHistory.relatedVisits")
      .populate("familyHistory.relatedConditions")
      .populate("allergies.allergenInfo")
      .populate("vaccinations.visitId");

    if (!medicalRecord) {
      throw new AppError("Medical history not found", 404);
    }

    return medicalRecord;
  }

  /**
   * Get or create medical history
   */
  static async getOrCreate(patientId) {
    let record = await MedicalRecord.findOne({ patientId });

    if (!record) {
      record = new MedicalRecord({ patientId });
      await record.save();
    }

    return record;
  }

  /**
   * Get personal history
   */
  static async getPersonalHistory(patientId) {
    const record = await MedicalRecord.findOne(
      { patientId },
      { personalHistory: 1 }
    );

    return record?.personalHistory || [];
  }

  /**
   * Add personal condition
   */
  static async addPersonalCondition(patientId, conditionData) {
    const record = await this.getOrCreate(patientId);

    record.personalHistory.push(conditionData);
    await record.save();

    return record;
  }

  /**
   * Update personal condition
   */
  static async updatePersonalCondition(patientId, conditionId, updateData) {
    const record = await MedicalRecord.findOne({
      patientId,
      "personalHistory._id": conditionId,
    });

    if (!record) {
      throw new AppError("Condition not found", 404);
    }

    const condition = record.personalHistory.id(conditionId);
    Object.assign(condition, updateData);
    await record.save();

    return record;
  }

  /**
   * Delete personal condition
   */
  static async deletePersonalCondition(patientId, conditionId) {
    const record = await MedicalRecord.findOne({
      patientId,
      "personalHistory._id": conditionId,
    });

    if (!record) {
      throw new AppError("Condition not found", 404);
    }

    record.personalHistory.id(conditionId).remove();
    await record.save();

    return record;
  }

  /**
   * Get family history
   */
  static async getFamilyHistory(patientId) {
    const record = await MedicalRecord.findOne(
      { patientId },
      { familyHistory: 1 }
    );

    return record?.familyHistory || [];
  }

  /**
   * Add family condition
   */
  static async addFamilyCondition(patientId, conditionData) {
    const record = await this.getOrCreate(patientId);

    record.familyHistory.push(conditionData);
    await record.save();

    return record;
  }

  /**
   * Update family condition
   */
  static async updateFamilyCondition(patientId, conditionId, updateData) {
    const record = await MedicalRecord.findOne({
      patientId,
      "familyHistory._id": conditionId,
    });

    if (!record) {
      throw new AppError("Family condition not found", 404);
    }

    const condition = record.familyHistory.id(conditionId);
    Object.assign(condition, updateData);
    await record.save();

    return record;
  }

  /**
   * Delete family condition
   */
  static async deleteFamilyCondition(patientId, conditionId) {
    const record = await MedicalRecord.findOne({
      patientId,
      "familyHistory._id": conditionId,
    });

    if (!record) {
      throw new AppError("Family condition not found", 404);
    }

    record.familyHistory.id(conditionId).remove();
    await record.save();

    return record;
  }

  /**
   * Get allergies
   */
  static async getAllergies(patientId) {
    const record = await MedicalRecord.findOne({ patientId }, { allergies: 1 });

    return record?.allergies || [];
  }

  /**
   * Add allergy
   */
  static async addAllergy(patientId, allergyData) {
    const record = await this.getOrCreate(patientId);

    // Check for duplicate allergens
    const exists = record.allergies.some(
      (a) => a.allergen.toLowerCase() === allergyData.allergen.toLowerCase()
    );

    if (exists) {
      throw new AppError("Allergy already exists", 409);
    }

    record.allergies.push(allergyData);
    await record.save();

    return record;
  }

  /**
   * Update allergy
   */
  static async updateAllergy(patientId, allergyId, updateData) {
    const record = await MedicalRecord.findOne({
      patientId,
      "allergies._id": allergyId,
    });

    if (!record) {
      throw new AppError("Allergy not found", 404);
    }

    const allergy = record.allergies.id(allergyId);
    Object.assign(allergy, updateData);
    await record.save();

    return record;
  }

  /**
   * Delete allergy
   */
  static async deleteAllergy(patientId, allergyId) {
    const record = await MedicalRecord.findOne({
      patientId,
      "allergies._id": allergyId,
    });

    if (!record) {
      throw new AppError("Allergy not found", 404);
    }

    record.allergies.id(allergyId).remove();
    await record.save();

    return record;
  }

  /**
   * Get vaccinations
   */
  static async getVaccinations(patientId) {
    const record = await MedicalRecord.findOne(
      { patientId },
      { vaccinations: 1 }
    );

    return record?.vaccinations || [];
  }

  /**
   * Add vaccination
   */
  static async addVaccination(patientId, vaccinationData) {
    const record = await this.getOrCreate(patientId);

    record.vaccinations.push(vaccinationData);
    await record.save();

    return record;
  }

  /**
   * Update vaccination
   */
  static async updateVaccination(patientId, vaccinationId, updateData) {
    const record = await MedicalRecord.findOne({
      patientId,
      "vaccinations._id": vaccinationId,
    });

    if (!record) {
      throw new AppError("Vaccination not found", 404);
    }

    const vaccination = record.vaccinations.id(vaccinationId);
    Object.assign(vaccination, updateData);
    await record.save();

    return record;
  }

  /**
   * Delete vaccination
   */
  static async deleteVaccination(patientId, vaccinationId) {
    const record = await MedicalRecord.findOne({
      patientId,
      "vaccinations._id": vaccinationId,
    });

    if (!record) {
      throw new AppError("Vaccination not found", 404);
    }

    record.vaccinations.id(vaccinationId).remove();
    await record.save();

    return record;
  }

  /**
   * Get vaccinations due soon
   */
  static async getVaccinationsDue(patientId, daysAhead = 30) {
    const record = await this.getComplete(patientId);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const due = record.vaccinations.filter((v) => {
      if (v.status === "UP_TO_DATE") return false;
      if (v.status === "OVERDUE") return true;

      if (v.nextDueDate) {
        return v.nextDueDate <= futureDate;
      }

      return false;
    });

    return due;
  }

  /**
   * Update lifestyle factors
   */
  static async updateLifestyleFactors(patientId, lifestyleData) {
    const record = await this.getOrCreate(patientId);

    if (lifestyleData.smokingStatus !== undefined) {
      record.lifestyleFactors.smokingStatus = lifestyleData.smokingStatus;
    }

    if (lifestyleData.alcoholConsumption !== undefined) {
      record.lifestyleFactors.alcoholConsumption =
        lifestyleData.alcoholConsumption;
    }

    if (lifestyleData.exerciseFrequency !== undefined) {
      record.lifestyleFactors.exerciseFrequency =
        lifestyleData.exerciseFrequency;
    }

    if (lifestyleData.dietType !== undefined) {
      record.lifestyleFactors.dietType = lifestyleData.dietType;
    }

    if (lifestyleData.stressLevel !== undefined) {
      record.lifestyleFactors.stressLevel = lifestyleData.stressLevel;
    }

    await record.save();
    return record;
  }

  /**
   * Get risk factors
   */
  static async getRiskFactors(patientId) {
    const record = await this.getComplete(patientId);

    const riskFactors = [];

    // Check for hereditary conditions
    const hasHereditary = record.familyHistory.some((fh) => fh.isHereditary);
    if (hasHereditary) {
      riskFactors.push({
        type: "HEREDITARY_CONDITIONS",
        severity: "HIGH",
        description: "Family history of genetic conditions",
      });
    }

    // Check for severe allergies
    const hasSevereAllergy = record.allergies.some(
      (a) => a.severity === "SEVERE"
    );
    if (hasSevereAllergy) {
      riskFactors.push({
        type: "SEVERE_ALLERGIES",
        severity: "HIGH",
        description: "Known severe allergies",
      });
    }

    // Check lifestyle factors
    if (record.lifestyleFactors.smokingStatus === "ACTIVE") {
      riskFactors.push({
        type: "SMOKING",
        severity: "MEDIUM",
        description: "Current smoker",
      });
    }

    return riskFactors;
  }
}

module.exports = MedicalHistoryService;
