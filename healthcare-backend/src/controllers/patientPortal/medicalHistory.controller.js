const MedicalHistory = require("../../models/medicalHistory.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");
const mongoose = require("mongoose");

/**
 * Medical History Controller
 * Quản lý lịch sử y tế, dị ứng, tiêm chủng, v.v.
 */

class MedicalHistoryController {
  /**
   * Lấy toàn bộ lịch sử y tế
   */
  static async getMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne({ patientId }).lean();

      if (!history) {
        return successResponse(
          res,
          {
            personalHistory: [],
            familyHistory: [],
            allergies: [],
            vaccinations: [],
            currentMedications: [],
            surgicalHistory: [],
            hospitalizationHistory: [],
            lifestyleFactors: {},
          },
          "Medical history not found",
          200
        );
      }

      successResponse(
        res,
        history,
        "Medical history retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy hoặc tạo medical history record
   */
  static async getOrCreateMedicalHistory(req, res, next) {
    try {
      const { patientId } = req.user;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = new MedicalHistory({
          patientId,
          personalHistory: [],
          familyHistory: [],
          allergies: [],
          vaccinations: [],
          currentMedications: [],
          surgicalHistory: [],
          hospitalizationHistory: [],
        });
        await history.save();
      }

      return history;
    } catch (error) {
      throw error;
    }
  }

  // ========== PERSONAL HISTORY ==========

  /**
   * Lấy lịch sử cá nhân
   */
  static async getPersonalHistory(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne(
        { patientId },
        { personalHistory: 1 }
      ).lean();

      successResponse(
        res,
        history?.personalHistory || [],
        "Personal history retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm điều kiện y tế cá nhân
   */
  static async addPersonalCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const conditionData = req.body;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = await MedicalHistoryController.getOrCreateMedicalHistory({
          user: { patientId },
        });
      }

      history.personalHistory.push({
        _id: mongoose.Types.ObjectId(),
        ...conditionData,
        createdAt: new Date(),
      });

      await history.save();

      successResponse(
        res,
        history.personalHistory,
        "Personal condition added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật điều kiện y tế cá nhân
   */
  static async updatePersonalCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const { conditionId } = req.params;
      const updates = req.body;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      const condition = history.personalHistory.id(conditionId);

      if (!condition) {
        return next(new AppError("Personal condition not found", 404));
      }

      Object.assign(condition, updates);
      await history.save();

      successResponse(
        res,
        history.personalHistory,
        "Personal condition updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa điều kiện y tế cá nhân
   */
  static async deletePersonalCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const { conditionId } = req.params;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      history.personalHistory.id(conditionId).remove();
      await history.save();

      successResponse(
        res,
        history.personalHistory,
        "Personal condition deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // ========== FAMILY HISTORY ==========

  /**
   * Lấy lịch sử gia đình
   */
  static async getFamilyHistory(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne(
        { patientId },
        { familyHistory: 1 }
      ).lean();

      successResponse(
        res,
        history?.familyHistory || [],
        "Family history retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm bệnh gia đình
   */
  static async addFamilyCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const conditionData = req.body;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = await MedicalHistoryController.getOrCreateMedicalHistory({
          user: { patientId },
        });
      }

      history.familyHistory.push({
        _id: mongoose.Types.ObjectId(),
        ...conditionData,
        createdAt: new Date(),
      });

      await history.save();

      successResponse(
        res,
        history.familyHistory,
        "Family condition added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật bệnh gia đình
   */
  static async updateFamilyCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const { familyHistoryId } = req.params;
      const updates = req.body;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      const condition = history.familyHistory.id(familyHistoryId);

      if (!condition) {
        return next(new AppError("Family condition not found", 404));
      }

      Object.assign(condition, updates);
      await history.save();

      successResponse(
        res,
        history.familyHistory,
        "Family condition updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa bệnh gia đình
   */
  static async deleteFamilyCondition(req, res, next) {
    try {
      const { patientId } = req.user;
      const { familyHistoryId } = req.params;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      history.familyHistory.id(familyHistoryId).remove();
      await history.save();

      successResponse(
        res,
        history.familyHistory,
        "Family condition deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // ========== ALLERGIES ==========

  /**
   * Lấy danh sách dị ứng
   */
  static async getAllergies(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne(
        { patientId },
        { allergies: 1 }
      ).lean();

      successResponse(
        res,
        history?.allergies || [],
        "Allergies retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm dị ứng
   */
  static async addAllergy(req, res, next) {
    try {
      const { patientId } = req.user;
      const allergyData = req.body;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = await MedicalHistoryController.getOrCreateMedicalHistory({
          user: { patientId },
        });
      }

      history.allergies.push({
        _id: mongoose.Types.ObjectId(),
        ...allergyData,
        createdAt: new Date(),
      });

      await history.save();

      successResponse(
        res,
        history.allergies,
        "Allergy added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật dị ứng
   */
  static async updateAllergy(req, res, next) {
    try {
      const { patientId } = req.user;
      const { allergyId } = req.params;
      const updates = req.body;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      const allergy = history.allergies.id(allergyId);

      if (!allergy) {
        return next(new AppError("Allergy not found", 404));
      }

      Object.assign(allergy, updates);
      await history.save();

      successResponse(
        res,
        history.allergies,
        "Allergy updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa dị ứng
   */
  static async deleteAllergy(req, res, next) {
    try {
      const { patientId } = req.user;
      const { allergyId } = req.params;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      history.allergies.id(allergyId).remove();
      await history.save();

      successResponse(
        res,
        history.allergies,
        "Allergy deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // ========== VACCINATIONS ==========

  /**
   * Lấy danh sách tiêm chủng
   */
  static async getVaccinations(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne(
        { patientId },
        { vaccinations: 1 }
      ).lean();

      successResponse(
        res,
        history?.vaccinations || [],
        "Vaccinations retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm tiêm chủng
   */
  static async addVaccination(req, res, next) {
    try {
      const { patientId } = req.user;
      const vaccinationData = req.body;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = await MedicalHistoryController.getOrCreateMedicalHistory({
          user: { patientId },
        });
      }

      history.vaccinations.push({
        _id: mongoose.Types.ObjectId(),
        ...vaccinationData,
        createdAt: new Date(),
      });

      await history.save();

      successResponse(
        res,
        history.vaccinations,
        "Vaccination added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật tiêm chủng
   */
  static async updateVaccination(req, res, next) {
    try {
      const { patientId } = req.user;
      const { vaccinationId } = req.params;
      const updates = req.body;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      const vaccination = history.vaccinations.id(vaccinationId);

      if (!vaccination) {
        return next(new AppError("Vaccination not found", 404));
      }

      Object.assign(vaccination, updates);
      await history.save();

      successResponse(
        res,
        history.vaccinations,
        "Vaccination updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa tiêm chủng
   */
  static async deleteVaccination(req, res, next) {
    try {
      const { patientId } = req.user;
      const { vaccinationId } = req.params;

      const history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        return next(new AppError("Medical history not found", 404));
      }

      history.vaccinations.id(vaccinationId).remove();
      await history.save();

      successResponse(
        res,
        history.vaccinations,
        "Vaccination deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách tiêm chủng cần tiêm
   */
  static async getVaccinationsDue(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne({ patientId }).lean();

      if (!history) {
        return successResponse(res, [], "No vaccinations found", 200);
      }

      const dueVaccinations = history.vaccinations.filter(
        (v) => v.status === "DUE_SOON" || v.status === "OVERDUE"
      );

      successResponse(
        res,
        dueVaccinations,
        "Due vaccinations retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật lifestyle factors
   */
  static async updateLifestyleFactors(req, res, next) {
    try {
      const { patientId } = req.user;
      const lifestyleData = req.body;

      let history = await MedicalHistory.findOne({ patientId });

      if (!history) {
        history = await MedicalHistoryController.getOrCreateMedicalHistory({
          user: { patientId },
        });
      }

      history.lifestyleFactors = {
        ...history.lifestyleFactors,
        ...lifestyleData,
      };

      await history.save();

      successResponse(
        res,
        history.lifestyleFactors,
        "Lifestyle factors updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lifestyle factors
   */
  static async getLifestyleFactors(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne(
        { patientId },
        { lifestyleFactors: 1 }
      ).lean();

      if (!history) {
        return successResponse(res, {}, "Lifestyle factors not found", 200);
      }

      successResponse(
        res,
        history.lifestyleFactors || {},
        "Lifestyle factors retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy toàn bộ lịch sử y tế (complete history)
   */
  static async getCompleteHistory(req, res, next) {
    try {
      const { patientId } = req.user;

      const history = await MedicalHistory.findOne({ patientId }).lean();

      if (!history) {
        return successResponse(
          res,
          {
            personalHistory: [],
            familyHistory: [],
            allergies: [],
            vaccinations: [],
            currentMedications: [],
            surgicalHistory: [],
            hospitalizationHistory: [],
            lifestyleFactors: {},
          },
          "Medical history not found",
          200
        );
      }

      successResponse(
        res,
        history,
        "Complete medical history retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MedicalHistoryController;
