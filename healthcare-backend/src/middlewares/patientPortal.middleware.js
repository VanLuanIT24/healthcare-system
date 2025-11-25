/**
 * 🏥 MIDDLEWARE CHO PATIENT PORTAL
 * - Xác thực người dùng (PATIENT role)
 * - Kiểm tra ownership (bệnh nhân chỉ được truy cập dữ liệu của mình)
 * - Kiểm tra quyền hạn truy cập
 */

const { AppError, ERROR_CODES } = require("./error.middleware");
const User = require("../models/user.model");

/**
 * 🛡️ MIDDLEWARE XÁC THỰC PATIENT
 * Đảm bảo người dùng đã xác thực và có role PATIENT hoặc quyền tương đương
 */
async function authPatient(req, res, next) {
  try {
    // Kiểm tra xem req.user đã được set bởi authenticate middleware
    if (!req.user) {
      throw new AppError(
        "Yêu cầu xác thực",
        401,
        ERROR_CODES.AUTH_INVALID_TOKEN
      );
    }

    // Kiểm tra role - PATIENT hoặc các role có quyền truy cập patient portal
    const allowedRoles = [
      "PATIENT",
      "DOCTOR",
      "NURSE",
      "RECEPTIONIST",
      "ADMIN",
      "SUPER_ADMIN",
    ];
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "Bạn không có quyền truy cập cổng thông tin bệnh nhân",
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSION
      );
    }

    // Gắn patientId từ req.user._id cho dễ sử dụng
    req.patientId = req.user._id;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Lỗi xác thực", 401, ERROR_CODES.AUTH_INVALID_TOKEN));
  }
}

/**
 * 🛡️ MIDDLEWARE KIỂM TRA OWNERSHIP
 * Đảm bảo bệnh nhân chỉ có thể truy cập dữ liệu của chính mình
 * Sử dụng cho các route có :patientId parameter
 */
function checkPatientOwnership(req, res, next) {
  try {
    // Lấy patientId từ params hoặc từ query
    const paramPatientId = req.params.patientId;

    // Kiểm tra xem req.user tồn tại
    if (!req.user) {
      throw new AppError(
        "Yêu cầu xác thực",
        401,
        ERROR_CODES.AUTH_INVALID_TOKEN
      );
    }

    // Kiểm tra ownership
    // - PATIENT chỉ có thể truy cập dữ liệu của mình
    // - ADMIN/SUPER_ADMIN/DOCTOR có thể truy cập tất cả
    if (
      req.user.role === "PATIENT" &&
      paramPatientId &&
      paramPatientId !== req.user._id.toString()
    ) {
      throw new AppError(
        "Bạn không có quyền truy cập dữ liệu của người dùng khác",
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSION
      );
    }

    // Nếu không có patientId trong params, sử dụng từ user
    if (!paramPatientId) {
      req.params.patientId = req.user._id.toString();
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(
      new AppError(
        "Lỗi kiểm tra quyền",
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSION
      )
    );
  }
}

/**
 * 🛡️ MIDDLEWARE CHỈ PATIENT
 * Đảm bảo chỉ PATIENT mới có thể truy cập (dùng cho các route riêng của PATIENT)
 */
function patientOnly(req, res, next) {
  try {
    if (!req.user) {
      throw new AppError(
        "Yêu cầu xác thực",
        401,
        ERROR_CODES.AUTH_INVALID_TOKEN
      );
    }

    if (req.user.role !== "PATIENT") {
      throw new AppError(
        "Chỉ bệnh nhân mới có thể truy cập",
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSION
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(
      new AppError(
        "Lỗi xác thực",
        403,
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSION
      )
    );
  }
}

module.exports = {
  authPatient,
  checkPatientOwnership,
  patientOnly,
};
