const Insurance = require("../../models/insurance.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Insurance Controller
 * Quản lý thông tin bảo hiểm của bệnh nhân
 */

class InsuranceController {
  /**
   * Lấy danh sách tất cả bảo hiểm
   */
  static async getInsurances(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, isPrimary, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;
      if (isPrimary !== undefined) filter.isPrimary = isPrimary === "true";

      const skip = (page - 1) * limit;
      const total = await Insurance.countDocuments(filter);

      const insurances = await Insurance.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        insurances,
        "Insurances retrieved successfully",
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
   * Lấy chi tiết một bảo hiểm
   */
  static async getInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const { insuranceId } = req.params;

      const insurance = await Insurance.findOne({
        _id: insuranceId,
        patientId,
      }).lean();

      if (!insurance) {
        return next(new AppError("Insurance not found", 404));
      }

      successResponse(res, insurance, "Insurance retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm bảo hiểm mới
   */
  static async addInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const insuranceData = req.body;

      // Nếu isPrimary = true, unset isPrimary cho các bảo hiểm khác
      if (insuranceData.isPrimary) {
        await Insurance.updateMany(
          { patientId, _id: { $ne: insuranceData._id } },
          { isPrimary: false }
        );
      }

      const insurance = new Insurance({
        patientId,
        ...insuranceData,
      });

      await insurance.save();

      successResponse(res, insurance, "Insurance added successfully", 201);
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Policy number already exists", 409));
      }
      next(error);
    }
  }

  /**
   * Cập nhật bảo hiểm
   */
  static async updateInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const { insuranceId } = req.params;
      const updates = req.body;

      // Nếu isPrimary = true, unset isPrimary cho các bảo hiểm khác
      if (updates.isPrimary === true) {
        await Insurance.updateMany(
          { patientId, _id: { $ne: insuranceId } },
          { isPrimary: false }
        );
      }

      const insurance = await Insurance.findOneAndUpdate(
        { _id: insuranceId, patientId },
        { ...updates, lastUpdatedBy: patientId },
        { new: true }
      );

      if (!insurance) {
        return next(new AppError("Insurance not found", 404));
      }

      successResponse(res, insurance, "Insurance updated successfully", 200);
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Policy number already exists", 409));
      }
      next(error);
    }
  }

  /**
   * Xóa bảo hiểm
   */
  static async deleteInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const { insuranceId } = req.params;

      const insurance = await Insurance.findOneAndDelete({
        _id: insuranceId,
        patientId,
      });

      if (!insurance) {
        return next(new AppError("Insurance not found", 404));
      }

      successResponse(res, null, "Insurance deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đặt bảo hiểm làm bảo hiểm chính
   */
  static async setPrimaryInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const { insuranceId } = req.params;

      // Unset isPrimary cho các bảo hiểm khác
      await Insurance.updateMany(
        { patientId, _id: { $ne: insuranceId } },
        { isPrimary: false }
      );

      const insurance = await Insurance.findOneAndUpdate(
        { _id: insuranceId, patientId },
        { isPrimary: true, lastUpdatedBy: patientId },
        { new: true }
      );

      if (!insurance) {
        return next(new AppError("Insurance not found", 404));
      }

      successResponse(
        res,
        insurance,
        "Set as primary insurance successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xác minh bảo hiểm
   */
  static async verifyInsurance(req, res, next) {
    try {
      const { patientId } = req.user;
      const { insuranceId } = req.params;

      const insurance = await Insurance.findOne({
        _id: insuranceId,
        patientId,
      });

      if (!insurance) {
        return next(new AppError("Insurance not found", 404));
      }

      // Simulate verification logic
      const isValid =
        insurance.status === "ACTIVE" &&
        new Date(insurance.expiryDate) > new Date();

      insurance.lastVerified = new Date();
      insurance.verificationStatus = isValid ? "VERIFIED" : "FAILED";

      await insurance.save();

      successResponse(
        res,
        {
          isValid,
          status: insurance.status,
          verificationStatus: insurance.verificationStatus,
          lastVerifiedAt: insurance.lastVerified,
          message: isValid
            ? "Insurance is valid and active"
            : "Insurance is expired or inactive",
        },
        "Insurance verification completed",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy bảo hiểm chính
   */
  static async getPrimaryInsurance(req, res, next) {
    try {
      const { patientId } = req.user;

      const insurance = await Insurance.findOne({
        patientId,
        isPrimary: true,
      }).lean();

      if (!insurance) {
        return successResponse(res, null, "No primary insurance found", 200);
      }

      successResponse(
        res,
        insurance,
        "Primary insurance retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InsuranceController;
