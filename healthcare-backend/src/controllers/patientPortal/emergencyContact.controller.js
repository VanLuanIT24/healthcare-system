const EmergencyContact = require("../../models/emergencyContact.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Emergency Contact Controller
 * Quản lý liên hệ khẩn cấp
 */

class EmergencyContactController {
  /**
   * Lấy danh sách tất cả liên hệ khẩn cấp
   */
  static async getEmergencyContacts(req, res, next) {
    try {
      const { patientId } = req.user;
      const { priority, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (priority) filter.priority = parseInt(priority);

      const skip = (page - 1) * limit;
      const total = await EmergencyContact.countDocuments(filter);

      const contacts = await EmergencyContact.find(filter)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        contacts,
        "Emergency contacts retrieved successfully",
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
   * Lấy chi tiết một liên hệ khẩn cấp
   */
  static async getEmergencyContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const { contactId } = req.params;

      const contact = await EmergencyContact.findOne({
        _id: contactId,
        patientId,
      }).lean();

      if (!contact) {
        return next(new AppError("Emergency contact not found", 404));
      }

      successResponse(
        res,
        contact,
        "Emergency contact retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm liên hệ khẩn cấp mới
   */
  static async addEmergencyContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const contactData = req.body;

      // Nếu isPrimary = true, unset isPrimary cho các contact khác
      if (contactData.isPrimary) {
        await EmergencyContact.updateMany({ patientId }, { isPrimary: false });
      }

      const contact = new EmergencyContact({
        patientId,
        ...contactData,
      });

      await contact.save();

      successResponse(
        res,
        contact,
        "Emergency contact added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật liên hệ khẩn cấp
   */
  static async updateEmergencyContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const { contactId } = req.params;
      const updates = req.body;

      // Nếu isPrimary = true, unset isPrimary cho các contact khác
      if (updates.isPrimary === true) {
        await EmergencyContact.updateMany(
          { patientId, _id: { $ne: contactId } },
          { isPrimary: false }
        );
      }

      const contact = await EmergencyContact.findOneAndUpdate(
        { _id: contactId, patientId },
        { ...updates, lastUpdatedBy: patientId },
        { new: true }
      );

      if (!contact) {
        return next(new AppError("Emergency contact not found", 404));
      }

      successResponse(
        res,
        contact,
        "Emergency contact updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa liên hệ khẩn cấp
   */
  static async deleteEmergencyContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const { contactId } = req.params;

      const contact = await EmergencyContact.findOneAndDelete({
        _id: contactId,
        patientId,
      });

      if (!contact) {
        return next(new AppError("Emergency contact not found", 404));
      }

      successResponse(res, null, "Emergency contact deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đặt làm liên hệ khẩn cấp chính
   */
  static async setPrimaryContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const { contactId } = req.params;

      // Unset isPrimary cho các contact khác
      await EmergencyContact.updateMany(
        { patientId, _id: { $ne: contactId } },
        { isPrimary: false }
      );

      const contact = await EmergencyContact.findOneAndUpdate(
        { _id: contactId, patientId },
        { isPrimary: true, lastUpdatedBy: patientId },
        { new: true }
      );

      if (!contact) {
        return next(new AppError("Emergency contact not found", 404));
      }

      successResponse(
        res,
        contact,
        "Set as primary emergency contact successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy liên hệ khẩn cấp chính
   */
  static async getPrimaryContact(req, res, next) {
    try {
      const { patientId } = req.user;

      const contact = await EmergencyContact.findOne({
        patientId,
        isPrimary: true,
      }).lean();

      if (!contact) {
        return successResponse(
          res,
          null,
          "No primary emergency contact found",
          200
        );
      }

      successResponse(
        res,
        contact,
        "Primary emergency contact retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy liên hệ khẩn cấp theo ưu tiên
   */
  static async getContactsByPriority(req, res, next) {
    try {
      const { patientId } = req.user;

      const contacts = await EmergencyContact.find({ patientId })
        .sort({ priority: 1 })
        .lean();

      successResponse(
        res,
        contacts,
        "Emergency contacts retrieved by priority",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xác minh liên hệ khẩn cấp
   */
  static async verifyContact(req, res, next) {
    try {
      const { patientId } = req.user;
      const { contactId } = req.params;

      const contact = await EmergencyContact.findOneAndUpdate(
        { _id: contactId, patientId },
        {
          isVerified: true,
          verifiedAt: new Date(),
        },
        { new: true }
      );

      if (!contact) {
        return next(new AppError("Emergency contact not found", 404));
      }

      successResponse(
        res,
        contact,
        "Emergency contact verified successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmergencyContactController;
