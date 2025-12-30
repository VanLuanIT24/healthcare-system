// src/controllers/appointment.controller.js
const appointmentService = require('../services/appointment.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class AppointmentController {
  async createAppointment(req, res, next) {
    try {
      const appointmentData = req.body;
      const currentUser = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Creating appointment:', {
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        creator: currentUser.email
      });

      const appointment = await appointmentService.createAppointment(appointmentData, currentUser);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE, {
        metadata: {
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          createdBy: currentUser._id
        }
      })(req, res, () => { });

      res.status(201).json({
        success: true,
        message: 'Tạo lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointments(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting appointments with filters:', query);

      const result = await appointmentService.getAppointments(query);

      res.json({
        success: true,
        data: result.appointments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting appointment by ID:', id);

      const appointment = await appointmentService.getAppointmentById(id);

      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        metadata: { appointmentId: id }
      })(req, res, () => { });

      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updater = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Updating appointment:', id);

      const appointment = await appointmentService.updateAppointment(id, updateData, updater);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: {
          appointmentId: id,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Cập nhật lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const canceller = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Cancelling appointment:', id);

      const appointment = await appointmentService.cancelAppointment(id, canceller, reason);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CANCEL, {
        metadata: { appointmentId: id, reason }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Hủy lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async requestCancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const requester = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Requesting cancel for appointment:', id);

      const appointment = await appointmentService.requestCancelAppointment(id, requester, reason);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_REQUEST_CANCEL, {
        metadata: { appointmentId: id, reason }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Yêu cầu hủy lịch hẹn đã được gửi',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async approveCancelRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { approved, note } = req.body;
      const approver = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Approving cancel request for appointment:', id);

      const appointment = await appointmentService.approveCancelRequest(id, approver, approved, note);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_APPROVE_CANCEL, {
        metadata: { appointmentId: id, approved }
      })(req, res, () => { });

      res.json({
        success: true,
        message: approved ? 'Yêu cầu hủy đã được duyệt' : 'Yêu cầu hủy bị từ chối',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async rescheduleAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { newTime } = req.body;
      const rescheduler = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Rescheduling appointment:', id);

      const appointment = await appointmentService.rescheduleAppointment(id, newTime, rescheduler);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { appointmentId: id, newTime }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Đặt lại lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async checkInAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const checker = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Checking in appointment:', id);

      const appointment = await appointmentService.checkInAppointment(id, checker);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { appointmentId: id, status: 'CHECKED_IN' }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Check-in thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async completeAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const completer = req.user;
      const notes = req.body.notes;

      console.log('🎯 [APPOINTMENT CONTROLLER] Completing appointment:', id);

      const appointment = await appointmentService.completeAppointment(id, completer, notes);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { appointmentId: id, status: 'COMPLETED' }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Hoàn thành lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async noShowAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const marker = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Marking no-show for appointment:', id);

      const appointment = await appointmentService.noShowAppointment(id, marker, reason);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { appointmentId: id, status: 'NO_SHOW' }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Đánh dấu no-show thành công',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorAppointments(req, res, next) {
    try {
      let { doctorId } = req.params;
      const query = req.query;

      // Handle special 'me' value
      if (doctorId === 'me') {
        doctorId = req.user._id;
      }

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting doctor appointments:', doctorId);

      const result = await appointmentService.getDoctorAppointments({ doctorId, ...query });

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        metadata: { doctorId }
      })(req, res, () => { });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientAppointments(req, res, next) {
    try {
      let { patientId } = req.params;
      const query = req.query;

      // Handle special 'me' value
      if (patientId === 'me') {
        patientId = req.user._id;
      }

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting patient appointments:', patientId);

      const result = await appointmentService.getPatientAppointments({ patientId, ...query });

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        metadata: { patientId }
      })(req, res, () => { });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayAppointments(req, res, next) {
    try {
      console.log('🎯 [APPOINTMENT CONTROLLER] Getting today appointments');

      const appointments = await appointmentService.getTodayAppointments(req.user);

      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingAppointments(req, res, next) {
    try {
      const { days } = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting upcoming appointments');

      const appointments = await appointmentService.getUpcomingAppointments(req.user, days);

      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { doctorId, date } = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting available slots');

      const slots = await appointmentService.getAvailableSlots(doctorId, date);

      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorSchedule(req, res, next) {
    try {
      let { doctorId } = req.params;
      const { date, week } = req.query;

      // Handle special 'me' value to get current user's schedule
      if (doctorId === 'me') {
        doctorId = req.user._id;
        console.log('🎯 [APPOINTMENT CONTROLLER] Getting schedule for current doctor:', doctorId);
      } else {
        console.log('🎯 [APPOINTMENT CONTROLLER] Getting doctor schedule for doctor:', doctorId);
      }

      const schedule = await appointmentService.getDoctorSchedule(doctorId, date, week);

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async createDoctorSchedule(req, res, next) {
    try {
      const scheduleData = req.body;
      const creator = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Creating doctor schedule');

      const schedule = await appointmentService.createDoctorSchedule(scheduleData, creator);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE, {
        metadata: { scheduleId: schedule._id }
      })(req, res, () => { });

      res.status(201).json({
        success: true,
        message: 'Tạo lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDoctorSchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const updateData = req.body;
      const updater = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Updating doctor schedule');

      const schedule = await appointmentService.updateDoctorSchedule(scheduleId, updateData, updater);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { scheduleId }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Cập nhật lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDoctorSchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const deleter = req.user;

      console.log('🎯 [APPOINTMENT CONTROLLER] Deleting doctor schedule');

      await appointmentService.deleteDoctorSchedule(scheduleId, deleter);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_DELETE, {
        metadata: { scheduleId }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Xóa lịch làm việc thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async sendReminder(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🎯 [APPOINTMENT CONTROLLER] Sending reminder');

      const result = await appointmentService.sendReminder(id);

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { appointmentId: id, action: 'SEND_REMINDER' }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Gửi nhắc nhở thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async sendBulkReminders(req, res, next) {
    try {
      console.log('🎯 [APPOINTMENT CONTROLLER] Sending bulk reminders');

      const result = await appointmentService.sendBulkReminders();

      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        metadata: { action: 'SEND_BULK_REMINDERS', count: result.successful }
      })(req, res, () => { });

      res.json({
        success: true,
        message: 'Gửi nhắc nhở hàng loạt thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentStats(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting appointment stats');

      const stats = await appointmentService.getAppointmentStats(query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async exportAppointmentsPDF(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Exporting PDF');

      const pdf = await appointmentService.exportAppointmentsPDF(query);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=appointments.pdf');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  async exportAppointmentsExcel(req, res, next) {
    try {
      const query = req.query;

      console.log('🎯 [APPOINTMENT CONTROLLER] Exporting Excel');

      const excel = await appointmentService.exportAppointmentsExcel(query);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=appointments.xlsx');
      res.send(excel);
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentAccessLogs(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🎯 [APPOINTMENT CONTROLLER] Getting access logs for appointment:', id);

      const logs = await appointmentService.getAppointmentAccessLogs(id);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();