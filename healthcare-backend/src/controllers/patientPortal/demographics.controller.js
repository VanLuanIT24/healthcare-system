const Demographics = require("../../models/demographics.model");
const AppError = require("../../utils/appError");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

/**
 * Demographics Controller
 * Quản lý hồ sơ cá nhân của bệnh nhân
 */

class DemographicsController {
  /**
   * Lấy thông tin demographics của bệnh nhân
   */
  static async getDemographics(req, res, next) {
    try {
      const { patientId } = req.user;

      const demographics = await Demographics.findOne({ patientId }).lean();

      if (!demographics) {
        return successResponse(res, null, "Demographics not found", 200);
      }

      successResponse(
        res,
        demographics,
        "Demographics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo hoặc cập nhật demographics
   */
  static async createOrUpdateDemographics(req, res, next) {
    try {
      const { patientId } = req.user;
      const updates = req.body;

      // Check existing
      let demographics = await Demographics.findOne({ patientId });

      if (!demographics) {
        // Create new
        demographics = new Demographics({
          patientId,
          ...updates,
        });
      } else {
        // Update existing
        Object.assign(demographics, updates);
        demographics.lastUpdatedBy = patientId;
      }

      await demographics.save();

      successResponse(
        res,
        demographics,
        demographics.isNew
          ? "Demographics created successfully"
          : "Demographics updated successfully",
        demographics.isNew ? 201 : 200
      );
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Trường này đã tồn tại", 409));
      }
      next(error);
    }
  }

  /**
   * Cập nhật địa chỉ
   */
  static async addAddress(req, res, next) {
    try {
      const { patientId } = req.user;
      const {
        street,
        city,
        district,
        ward,
        zipCode,
        country,
        addressType,
        isDefault,
      } = req.body;

      const demographics = await Demographics.findOne({ patientId });

      if (!demographics) {
        return next(
          new AppError(
            "Demographics not found. Please create demographics first",
            404
          )
        );
      }

      // Nếu isDefault = true, unset isDefault cho các địa chỉ khác
      if (isDefault) {
        demographics.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      demographics.addresses.push({
        _id: require("mongoose").Types.ObjectId(),
        street,
        city,
        district,
        ward,
        zipCode,
        country: country || "Vietnam",
        addressType: addressType || "HOME",
        isDefault: isDefault || false,
      });

      await demographics.save();

      successResponse(res, demographics, "Address added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật địa chỉ
   */
  static async updateAddress(req, res, next) {
    try {
      const { patientId } = req.user;
      const { addressId } = req.params;
      const updates = req.body;

      const demographics = await Demographics.findOne({ patientId });

      if (!demographics) {
        return next(new AppError("Demographics not found", 404));
      }

      const address = demographics.addresses.id(addressId);

      if (!address) {
        return next(new AppError("Address not found", 404));
      }

      // Nếu isDefault = true, unset isDefault cho các địa chỉ khác
      if (updates.isDefault === true) {
        demographics.addresses.forEach((addr) => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      Object.assign(address, updates);
      await demographics.save();

      successResponse(res, demographics, "Address updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa địa chỉ
   */
  static async deleteAddress(req, res, next) {
    try {
      const { patientId } = req.user;
      const { addressId } = req.params;

      const demographics = await Demographics.findOne({ patientId });

      if (!demographics) {
        return next(new AppError("Demographics not found", 404));
      }

      demographics.addresses.id(addressId).remove();
      await demographics.save();

      successResponse(res, demographics, "Address deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách địa chỉ
   */
  static async getAddresses(req, res, next) {
    try {
      const { patientId } = req.user;

      const demographics = await Demographics.findOne(
        { patientId },
        { addresses: 1 }
      ).lean();

      if (!demographics) {
        return successResponse(res, [], "No addresses found", 200);
      }

      successResponse(
        res,
        demographics.addresses || [],
        "Addresses retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa demographics (soft delete)
   */
  static async deleteDemographics(req, res, next) {
    try {
      const { patientId } = req.user;
      const { demographicsId } = req.params;

      const demographics = await Demographics.findOneAndDelete({
        _id: demographicsId,
        patientId,
      });

      if (!demographics) {
        return next(new AppError("Demographics not found", 404));
      }

      successResponse(res, null, "Demographics deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DemographicsController;
