const Appointment = require("../../models/appointment.model");
const User = require("../../models/user.model");
const Consultation = require("../../models/consultation.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Patient Appointments Controller
 * Quản lý appointment từ phía bệnh nhân
 */

class AppointmentsController {
  /**
   * Lấy danh sách appointments của bệnh nhân
   */
  static async getMyAppointments(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { status, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await Appointment.countDocuments(filter);

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("doctorId", "name specialization email phone")
        .lean();

      successResponse(
        res,
        appointments,
        "Your appointments retrieved successfully",
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
   * Lấy chi tiết appointment
   */
  static async getAppointmentDetail(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { appointmentId } = req.params;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      })
        .populate("doctorId", "name specialization email phone")
        .populate("consultationId");

      if (!appointment) {
        return next(new AppError("Appointment not found", 404));
      }

      successResponse(
        res,
        appointment,
        "Appointment details retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy upcoming appointments
   */
  static async getUpcomingAppointments(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { limit = 5 } = req.query;

      const now = new Date();

      const appointments = await Appointment.find({
        patientId,
        appointmentDate: { $gte: now },
        status: { $in: ["SCHEDULED", "CONFIRMED"] },
      })
        .sort({ appointmentDate: 1 })
        .limit(parseInt(limit))
        .populate("doctorId", "name specialization email")
        .lean();

      successResponse(
        res,
        appointments,
        "Upcoming appointments retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy past appointments
   */
  static async getPastAppointments(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { page = 1, limit = 10 } = req.query;

      const now = new Date();
      const skip = (page - 1) * limit;

      const filter = {
        patientId,
        appointmentDate: { $lt: now },
      };

      const total = await Appointment.countDocuments(filter);

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("doctorId", "name specialization email")
        .lean();

      successResponse(
        res,
        appointments,
        "Past appointments retrieved successfully",
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
   * Đặt lịch hẹn mới
   */
  static async bookAppointment(req, res, next) {
    try {
      // Get patientId from req.user._id (set by authenticate middleware)
      const patientId = req.user._id || req.patientId;
      const {
        doctorId,
        appointmentDate,
        appointmentTime,
        reason,
        type = "Consultation",
        departmentId,
        notes,
      } = req.body;

      // Validate required fields
      if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
        return next(new AppError("Missing required fields", 400));
      }

      // Validate doctor exists
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== "DOCTOR") {
        return next(new AppError("Invalid doctor", 404));
      }

      // Parse appointmentDate if it's a string
      let appointmentDateObj = new Date(appointmentDate);
      if (isNaN(appointmentDateObj.getTime())) {
        return next(new AppError("Invalid appointment date format", 400));
      }

      // Validate appointmentTime format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentTime)) {
        return next(new AppError("Invalid time format. Expected HH:MM", 400));
      }

      // Create date range for the appointment date
      const startOfDay = new Date(appointmentDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDateObj);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if appointment slot is available
      const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        appointmentTime,
        status: { $in: ["SCHEDULED", "CONFIRMED"] },
      });

      if (existingAppointment) {
        return next(new AppError("This time slot is not available", 400));
      }

      // Generate unique appointmentId
      const appointmentId = `APT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create appointment
      const appointment = new Appointment({
        appointmentId,
        patientId,
        doctorId,
        departmentId,
        appointmentDate: appointmentDateObj,
        appointmentTime,
        reason,
        type,
        notes,
        status: "SCHEDULED",
        createdBy: patientId,
        location: "Hospital", // Default location, can be updated by admin
        mode: "IN_PERSON", // Default mode
      });

      await appointment.save();
      await appointment.populate("doctorId", "name specialization email");

      successResponse(res, appointment, "Appointment booked successfully", 201);
    } catch (error) {
      if (error.code === 11000) {
        return next(
          new AppError("Appointment already exists at this time", 409)
        );
      }
      next(error);
    }
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { appointmentId } = req.params;
      const { newAppointmentDate, newAppointmentTime, reason } = req.body;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      });

      if (!appointment) {
        return next(new AppError("Appointment not found", 404));
      }

      // Check if appointment can be rescheduled
      if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
        return next(
          new AppError(
            "Cannot reschedule this appointment. It has already been completed or cancelled.",
            400
          )
        );
      }

      // Check if appointment is in the future
      if (appointment.appointmentDate < new Date()) {
        return next(new AppError("Cannot reschedule a past appointment", 400));
      }

      // Check if new slot is available
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctorId: appointment.doctorId,
        appointmentDate: newAppointmentDate,
        appointmentTime: newAppointmentTime,
        status: { $in: ["SCHEDULED", "CONFIRMED"] },
      });

      if (conflictingAppointment) {
        return next(new AppError("The new time slot is not available", 400));
      }

      // Update appointment
      appointment.appointmentDate = newAppointmentDate;
      appointment.appointmentTime = newAppointmentTime;
      appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
      appointment.rescheduleReason = reason;
      appointment.rescheduleDate = new Date();

      await appointment.save();

      successResponse(
        res,
        appointment,
        "Appointment rescheduled successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy appointment
   */
  static async cancelAppointment(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { appointmentId } = req.params;
      const { reason } = req.body;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      });

      if (!appointment) {
        return next(new AppError("Appointment not found", 404));
      }

      // Check if appointment can be cancelled
      if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
        return next(
          new AppError(
            "Cannot cancel this appointment. It has already been completed or cancelled.",
            400
          )
        );
      }

      // Check if appointment is at least 24 hours away
      const hoursUntilAppointment =
        (appointment.appointmentDate - new Date()) / (1000 * 60 * 60);

      if (hoursUntilAppointment < 24) {
        return next(
          new AppError(
            "Appointments must be cancelled at least 24 hours in advance",
            400
          )
        );
      }

      appointment.status = "CANCELLED";
      appointment.cancellationReason = reason;
      appointment.cancellationDate = new Date();

      await appointment.save();

      successResponse(
        res,
        appointment,
        "Appointment cancelled successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm appointment attendance
   */
  static async confirmAttendance(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;
      const { appointmentId } = req.params;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      });

      if (!appointment) {
        return next(new AppError("Appointment not found", 404));
      }

      if (appointment.status !== "CONFIRMED") {
        return next(
          new AppError(
            "Only confirmed appointments can be confirmed for attendance",
            400
          )
        );
      }

      appointment.attendanceStatus = "CONFIRMED";
      appointment.attendanceConfirmedAt = new Date();

      await appointment.save();

      successResponse(
        res,
        appointment,
        "Attendance confirmed successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available appointment slots
   */
  static async getAvailableSlots(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { appointmentDate } = req.query;

      // Validate inputs
      if (!doctorId || !appointmentDate) {
        return next(
          new AppError("doctorId and appointmentDate are required", 400)
        );
      }

      // Parse and validate the date
      const dateObj = new Date(appointmentDate);
      if (isNaN(dateObj.getTime())) {
        return next(new AppError("Invalid appointment date format", 400));
      }

      // Create date range
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      // Get booked appointments for the doctor on that date
      const bookedAppointments = await Appointment.find({
        doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        status: { $in: ["SCHEDULED", "CONFIRMED"] },
      }).select("appointmentTime");

      const bookedTimes = bookedAppointments.map((apt) => apt.appointmentTime);

      // Define available time slots (e.g., 30-minute intervals)
      const availableSlots = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      const slotDuration = 30; // 30 minutes

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const time = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          if (!bookedTimes.includes(time)) {
            availableSlots.push({
              time,
              available: true,
            });
          }
        }
      }

      successResponse(
        res,
        availableSlots,
        "Available slots retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(req, res, next) {
    try {
      const patientId = req.user._id || req.patientId;

      const stats = await Appointment.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            scheduled: {
              $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] },
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
            noShow: {
              $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] },
            },
          },
        },
      ]);

      successResponse(
        res,
        stats[0] || {},
        "Appointment statistics retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AppointmentsController;
