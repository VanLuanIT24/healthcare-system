const Visit = require("../../models/visit.model");
const Prescription = require("../../models/prescription.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Visit Controller
 * Quản lý lịch sử khám bệnh
 */

class VisitController {
  /**
   * Lấy danh sách tất cả lần khám
   */
  static async getVisits(req, res, next) {
    try {
      const { patientId } = req.user;
      const {
        status,
        page = 1,
        limit = 10,
        sortBy = "visitDate",
        order = "desc",
      } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await Visit.countDocuments(filter);

      const sortObj = { [sortBy]: order === "desc" ? -1 : 1 };

      const visits = await Visit.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(res, visits, "Visits retrieved successfully", 200, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết một lần khám
   */
  static async getVisit(req, res, next) {
    try {
      const { patientId } = req.user;
      const { visitId } = req.params;

      const visit = await Visit.findOne({
        _id: visitId,
        patientId,
      })
        .populate("doctorId", "firstName lastName email specialization")
        .populate("prescriptionIds", "medications prescriptionDate status")
        .lean();

      if (!visit) {
        return next(new AppError("Visit not found", 404));
      }

      successResponse(res, visit, "Visit retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách lần khám sắp tới
   */
  static async getUpcomingVisits(req, res, next) {
    try {
      const { patientId } = req.user;
      const limit = parseInt(req.query.limit) || 5;

      const visits = await Visit.find({
        patientId,
        visitDate: { $gte: new Date() },
        status: { $in: ["SCHEDULED", "CONFIRMED"] },
      })
        .sort({ visitDate: 1 })
        .limit(limit)
        .lean();

      successResponse(
        res,
        visits,
        "Upcoming visits retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách lần khám gần đây
   */
  static async getRecentVisits(req, res, next) {
    try {
      const { patientId } = req.user;
      const limit = parseInt(req.query.limit) || 5;

      const visits = await Visit.find({
        patientId,
        status: "COMPLETED",
      })
        .sort({ visitDate: -1 })
        .limit(limit)
        .lean();

      successResponse(res, visits, "Recent visits retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo visit record (từ appointment)
   */
  static async createVisit(req, res, next) {
    try {
      const { patientId } = req.user;
      const visitData = req.body;

      const visit = new Visit({
        patientId,
        ...visitData,
        status: "IN_PROGRESS",
      });

      await visit.save();

      successResponse(res, visit, "Visit created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật visit (sau khi khám)
   */
  static async updateVisit(req, res, next) {
    try {
      const { patientId } = req.user;
      const { visitId } = req.params;
      const updates = req.body;

      const visit = await Visit.findOneAndUpdate(
        { _id: visitId, patientId },
        { ...updates, lastModifiedBy: patientId },
        { new: true }
      );

      if (!visit) {
        return next(new AppError("Visit not found", 404));
      }

      successResponse(res, visit, "Visit updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hoàn thành visit
   */
  static async completeVisit(req, res, next) {
    try {
      const { patientId } = req.user;
      const { visitId } = req.params;
      const { diagnosis, assessment, treatment, notes } = req.body;

      const visit = await Visit.findOneAndUpdate(
        { _id: visitId, patientId },
        {
          status: "COMPLETED",
          diagnosis,
          assessment,
          treatment,
          notes,
          completedAt: new Date(),
          completedBy: patientId,
        },
        { new: true }
      );

      if (!visit) {
        return next(new AppError("Visit not found", 404));
      }

      successResponse(res, visit, "Visit completed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy visit
   */
  static async cancelVisit(req, res, next) {
    try {
      const { patientId } = req.user;
      const { visitId } = req.params;
      const { reason } = req.body;

      const visit = await Visit.findOneAndUpdate(
        { _id: visitId, patientId },
        {
          status: "CANCELLED",
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledBy: patientId,
        },
        { new: true }
      );

      if (!visit) {
        return next(new AppError("Visit not found", 404));
      }

      successResponse(res, visit, "Visit cancelled successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy visits theo bác sĩ
   */
  static async getVisitsByDoctor(req, res, next) {
    try {
      const { patientId } = req.user;
      const { doctorId, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (doctorId) filter.doctorId = doctorId;

      const skip = (page - 1) * limit;
      const total = await Visit.countDocuments(filter);

      const visits = await Visit.find(filter)
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        visits,
        "Visits by doctor retrieved successfully",
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
   * Lấy visits theo phòng khám
   */
  static async getVisitsByDepartment(req, res, next) {
    try {
      const { patientId } = req.user;
      const { departmentId, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (departmentId) filter.departmentId = departmentId;

      const skip = (page - 1) * limit;
      const total = await Visit.countDocuments(filter);

      const visits = await Visit.find(filter)
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        visits,
        "Visits by department retrieved successfully",
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
   * Lấy recommendations từ một visit
   */
  static async getRecommendations(req, res, next) {
    try {
      const { patientId } = req.user;
      const { visitId } = req.params;

      const visit = await Visit.findOne(
        { _id: visitId, patientId },
        { recommendations: 1 }
      ).lean();

      if (!visit) {
        return next(new AppError("Visit not found", 404));
      }

      successResponse(
        res,
        visit.recommendations || [],
        "Recommendations retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VisitController;
