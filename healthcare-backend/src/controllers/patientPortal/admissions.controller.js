const Admission = require("../../models/admission.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Admission Controller
 * Quản lý lịch sử nhập viện
 */

class AdmissionController {
  /**
   * Lấy danh sách tất cả nhập viện
   */
  static async getAdmissions(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await Admission.countDocuments(filter);

      const admissions = await Admission.find(filter)
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        admissions,
        "Admissions retrieved successfully",
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
   * Lấy chi tiết một nhập viện
   */
  static async getAdmission(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;

      const admission = await Admission.findOne({
        _id: admissionId,
        patientId,
      })
        .populate(
          "attendingPhysician.doctorId",
          "firstName lastName email specialization"
        )
        .lean();

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(res, admission, "Admission retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy nhập viện hiện tại (nếu có)
   */
  static async getCurrentAdmission(req, res, next) {
    try {
      const { patientId } = req.user;

      const admission = await Admission.findOne({
        patientId,
        status: "ACTIVE",
      }).lean();

      if (!admission) {
        return successResponse(res, null, "No active admission found", 200);
      }

      successResponse(
        res,
        admission,
        "Current admission retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách nhập viện đang hoạt động
   */
  static async getActiveAdmissions(req, res, next) {
    try {
      const { patientId } = req.user;

      const admissions = await Admission.find({
        patientId,
        status: "ACTIVE",
      })
        .sort({ admissionDate: -1 })
        .lean();

      successResponse(
        res,
        admissions,
        "Active admissions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách xuất viện
   */
  static async getDischargedAdmissions(req, res, next) {
    try {
      const { patientId } = req.user;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const total = await Admission.countDocuments({
        patientId,
        status: "DISCHARGED",
      });

      const admissions = await Admission.find({
        patientId,
        status: "DISCHARGED",
      })
        .sort({ dischargeDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        admissions,
        "Discharged admissions retrieved successfully",
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
   * Tạo nhập viện record
   */
  static async createAdmission(req, res, next) {
    try {
      const { patientId } = req.user;
      const admissionData = req.body;

      const admission = new Admission({
        patientId,
        ...admissionData,
        status: "ACTIVE",
      });

      await admission.save();

      successResponse(res, admission, "Admission created successfully", 201);
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Admission number already exists", 409));
      }
      next(error);
    }
  }

  /**
   * Cập nhật nhập viện
   */
  static async updateAdmission(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;
      const updates = req.body;

      const admission = await Admission.findOneAndUpdate(
        { _id: admissionId, patientId },
        { ...updates, lastModifiedBy: patientId },
        { new: true }
      );

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(res, admission, "Admission updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất viện
   */
  static async dischargeAdmission(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;
      const {
        dischargeType,
        dischargeDiagnosis,
        dischargeCondition,
        dischargePlan,
        followUpInstructions,
        dischargemedications,
      } = req.body;

      const admission = await Admission.findOneAndUpdate(
        { _id: admissionId, patientId },
        {
          status: "DISCHARGED",
          dischargeDate: new Date(),
          dischargeType,
          dischargeDiagnosis,
          dischargeCondition,
          dischargePlan,
          followUpInstructions,
          dischargemedications,
          dischargedBy: patientId,
        },
        { new: true }
      );

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(res, admission, "Patient discharged successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy discharge summary
   */
  static async getDischargeSummary(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;

      const admission = await Admission.findOne(
        {
          _id: admissionId,
          patientId,
        },
        {
          admissionNumber: 1,
          admissionDate: 1,
          dischargeDate: 1,
          departmentName: 1,
          primaryDiagnosis: 1,
          dischargeDiagnosis: 1,
          treatmentPlan: 1,
          dischargePlan: 1,
          dischargemedications: 1,
          followUpInstructions: 1,
          restrictions: 1,
        }
      ).lean();

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(
        res,
        admission,
        "Discharge summary retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy procedures trong nhập viện
   */
  static async getProcedures(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;

      const admission = await Admission.findOne(
        { _id: admissionId, patientId },
        { procedures: 1 }
      ).lean();

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(
        res,
        admission.procedures || [],
        "Procedures retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy investigations trong nhập viện
   */
  static async getInvestigations(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;

      const admission = await Admission.findOne(
        { _id: admissionId, patientId },
        { investigations: 1 }
      ).lean();

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      successResponse(
        res,
        admission.investigations || [],
        "Investigations retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy length of stay statistics
   */
  static async getLengthOfStayStats(req, res, next) {
    try {
      const { patientId } = req.user;

      const admissions = await Admission.find({
        patientId,
        status: "DISCHARGED",
      }).lean();

      const stats = {
        totalAdmissions: admissions.length,
        totalDays: admissions.reduce(
          (sum, adm) => sum + (adm.lengthOfStay || 0),
          0
        ),
        averageDays:
          admissions.length > 0
            ? Math.round(
                admissions.reduce(
                  (sum, adm) => sum + (adm.lengthOfStay || 0),
                  0
                ) / admissions.length
              )
            : 0,
        longestStay: Math.max(
          ...admissions.map((adm) => adm.lengthOfStay || 0),
          0
        ),
      };

      successResponse(
        res,
        stats,
        "Length of stay statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm thủ tục y tế
   */
  static async addProcedure(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;
      const { procedureName, procedureDate, surgeon, description, status } =
        req.body;

      const admission = await Admission.findOne({
        _id: admissionId,
        patientId,
      });

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      admission.procedures.push({
        procedureName,
        procedureDate,
        surgeon,
        description,
        status,
      });

      await admission.save();

      successResponse(
        res,
        admission.procedures,
        "Procedure added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm điều tra y tế
   */
  static async addInvestigation(req, res, next) {
    try {
      const { patientId } = req.user;
      const { admissionId } = req.params;
      const { investigationType, investigationDate, findings, status } =
        req.body;

      const admission = await Admission.findOne({
        _id: admissionId,
        patientId,
      });

      if (!admission) {
        return next(new AppError("Admission not found", 404));
      }

      admission.investigations.push({
        investigationType,
        investigationDate,
        findings,
        status,
      });

      await admission.save();

      successResponse(
        res,
        admission.investigations,
        "Investigation added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdmissionController;
