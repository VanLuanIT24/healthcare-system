const Appointment = require("../../models/appointment.model");
const User = require("../../models/user.model");
const AppError = require("../../utils/appError");

/**
 * Appointments Service
 * Business logic for patient appointments
 */

class AppointmentsService {
  /**
   * Get all appointments
   */
  static async getAll(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;

    return await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate("doctorId", "name specialization email")
      .lean();
  }

  /**
   * Get single appointment
   */
  static async getById(patientId, appointmentId) {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
    })
      .populate("doctorId", "name specialization email phone")
      .populate("departmentId", "name");

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    return appointment;
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcoming(patientId, limit = 5) {
    const now = new Date();

    return await Appointment.find({
      patientId,
      appointmentDate: { $gte: now },
      status: { $in: ["SCHEDULED", "CONFIRMED"] },
    })
      .sort({ appointmentDate: 1 })
      .limit(limit)
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Get past appointments
   */
  static async getPast(patientId, limit = 10) {
    const now = new Date();

    return await Appointment.find({
      patientId,
      appointmentDate: { $lt: now },
    })
      .sort({ appointmentDate: -1 })
      .limit(limit)
      .populate("doctorId", "name specialization")
      .lean();
  }

  /**
   * Book appointment
   */
  static async book(patientId, appointmentData) {
    // Validate doctor
    const doctor = await User.findById(appointmentData.doctorId);
    if (!doctor || doctor.role !== "DOCTOR") {
      throw new AppError("Invalid doctor", 404);
    }

    // Check slot availability
    const existing = await Appointment.findOne({
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      status: { $in: ["SCHEDULED", "CONFIRMED"] },
    });

    if (existing) {
      throw new AppError("This time slot is not available", 400);
    }

    const appointment = new Appointment({
      patientId,
      ...appointmentData,
      status: "SCHEDULED",
    });

    await appointment.save();
    await appointment.populate("doctorId", "name specialization email");

    return appointment;
  }

  /**
   * Reschedule appointment
   */
  static async reschedule(
    patientId,
    appointmentId,
    newAppointmentDate,
    newAppointmentTime,
    reason
  ) {
    const appointment = await this.getById(patientId, appointmentId);

    // Check if can be rescheduled
    if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
      throw new AppError(
        "Cannot reschedule this appointment. It has already been completed or cancelled.",
        400
      );
    }

    // Check if in the future
    if (appointment.appointmentDate < new Date()) {
      throw new AppError("Cannot reschedule a past appointment", 400);
    }

    // Check if new slot is available
    const conflict = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appointment.doctorId,
      appointmentDate: newAppointmentDate,
      appointmentTime: newAppointmentTime,
      status: { $in: ["SCHEDULED", "CONFIRMED"] },
    });

    if (conflict) {
      throw new AppError("The new time slot is not available", 400);
    }

    appointment.appointmentDate = newAppointmentDate;
    appointment.appointmentTime = newAppointmentTime;
    appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
    appointment.rescheduleReason = reason;
    appointment.rescheduleDate = new Date();

    await appointment.save();
    return appointment;
  }

  /**
   * Cancel appointment
   */
  static async cancel(patientId, appointmentId, reason) {
    const appointment = await this.getById(patientId, appointmentId);

    // Check if can be cancelled
    if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
      throw new AppError(
        "Cannot cancel this appointment. It has already been completed or cancelled.",
        400
      );
    }

    // Check if at least 24 hours away
    const hoursUntilAppointment =
      (appointment.appointmentDate - new Date()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      throw new AppError(
        "Appointments must be cancelled at least 24 hours in advance",
        400
      );
    }

    appointment.status = "CANCELLED";
    appointment.cancellationReason = reason;
    appointment.cancellationDate = new Date();

    await appointment.save();
    return appointment;
  }

  /**
   * Confirm attendance
   */
  static async confirmAttendance(patientId, appointmentId) {
    const appointment = await this.getById(patientId, appointmentId);

    if (appointment.status !== "CONFIRMED") {
      throw new AppError("Only confirmed appointments can be confirmed", 400);
    }

    appointment.attendanceStatus = "CONFIRMED";
    appointment.attendanceConfirmedAt = new Date();

    await appointment.save();
    return appointment;
  }

  /**
   * Get available slots
   */
  static async getAvailableSlots(doctorId, appointmentDate) {
    // Get booked appointments
    const booked = await Appointment.find({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ["SCHEDULED", "CONFIRMED"] },
    }).select("appointmentTime");

    const bookedTimes = booked.map((apt) => apt.appointmentTime);

    // Generate available slots
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        if (!bookedTimes.includes(time)) {
          slots.push({ time, available: true });
        }
      }
    }

    return slots;
  }

  /**
   * Get appointment statistics
   */
  static async getStatistics(patientId) {
    const appointments = await Appointment.find({ patientId });

    return {
      totalAppointments: appointments.length,
      scheduled: appointments.filter((a) => a.status === "SCHEDULED").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      noShow: appointments.filter((a) => a.status === "NO_SHOW").length,
    };
  }

  /**
   * Validate appointment data
   */
  static validateAppointmentData(data) {
    const errors = [];

    if (!data.doctorId) errors.push("Doctor ID is required");
    if (!data.appointmentDate) errors.push("Appointment date is required");
    if (!data.appointmentTime) errors.push("Appointment time is required");

    if (data.appointmentDate) {
      const appointDate = new Date(data.appointmentDate);
      const now = new Date();

      if (appointDate < now) {
        errors.push("Appointment date must be in the future");
      }
    }

    return errors;
  }
}

module.exports = AppointmentsService;
