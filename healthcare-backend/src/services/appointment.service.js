// src/services/appointment.service.js
const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const AuditLog = require('../models/auditLog.model');
const EmailService = require('../utils/email');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Lightweight doctor schedule model (kept here to avoid creating a new file)
const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlots: [
    {
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule', doctorScheduleSchema);

class AppointmentService {
  async createAppointment(appointmentData, currentUser) {
    // Validate required fields
    if (!appointmentData.doctorId) {
      throw new AppError('Vui lòng chọn bác sĩ', 400, ERROR_CODES.INVALID_DOCTOR);
    }
    if (!appointmentData.specialty) {
      throw new AppError('Vui lòng chọn chuyên khoa', 400, ERROR_CODES.INVALID_REQUEST);
    }
    if (!appointmentData.appointmentDate) {
      throw new AppError('Vui lòng chọn ngày giờ', 400, ERROR_CODES.INVALID_REQUEST);
    }

    // Validate doctor & patient
    const [doctor, patient] = await Promise.all([
      User.findById(appointmentData.doctorId),
      Patient.findOne({ $or: [{ _id: appointmentData.patientId }, { userId: appointmentData.patientId }] })
    ]);

    if (!doctor || doctor.role !== 'DOCTOR' || doctor.status !== 'ACTIVE') {
      throw new AppError('Bác sĩ không hợp lệ hoặc không hoạt động', 400, ERROR_CODES.INVALID_DOCTOR);
    }

    // Validate doctor has the requested specialty
    if (doctor.specialties && doctor.specialties.length > 0) {
      const hasSpecialty = doctor.specialties.some(spec =>
        spec.name && spec.name.toLowerCase() === appointmentData.specialty.toLowerCase()
      );
      if (!hasSpecialty) {
        throw new AppError('Bác sĩ không có chuyên khoa này', 400, ERROR_CODES.INVALID_REQUEST);
      }
    }

    if (!patient) {
      throw new AppError('Bệnh nhân không tồn tại', 400, ERROR_CODES.INVALID_PATIENT);
    }

    // Conflict check
    const hasConflict = await this.checkConflict(
      appointmentData.doctorId,
      appointmentData.appointmentDate,
      appointmentData.duration || 30
    );
    if (hasConflict) {
      throw new AppError('Trùng lịch hẹn', 409, ERROR_CODES.APPOINTMENT_CONFLICT);
    }

    const appointmentId = `APPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const appointment = new Appointment({
      ...appointmentData,
      appointmentId,
      status: appointmentData.status || 'SCHEDULED',
      createdBy: currentUser._id
    });

    await appointment.save();

    // 🎯 SEND NOTIFICATION TO DOCTOR
    try {
      const notificationService = require('./notification.service');
      await notificationService.sendNotification({
        title: '📅 Lịch hẹn mới',
        message: `Bệnh nhân ${patient.personalInfo?.fullName || patient.fullName} đã đặt lịch hẹn lúc ${new Date(appointmentData.appointmentDate).toLocaleString('vi-VN')}`,
        type: 'INFO',
        toUserId: doctor._id,
        metadata: { appointmentId: appointment._id }
      }, currentUser._id);
    } catch (error) {
      console.error('⚠️ Failed to send notification to doctor:', error.message);
    }

    await appointment.populate('patientId doctorId');
    return appointment;
  }

  async getAppointments(query) {
    const { page = 1, limit = 10, status, startDate, endDate, doctorId, patientId } = query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;

    if (query.search) {
      const searchTerms = query.search.trim().split(/\s+/);
      const searchPatterns = searchTerms.map(term => new RegExp(term, 'i'));

      // Find users matching search terms
      const matchingUsers = await User.find({
        $or: searchPatterns.map(pattern => ({
          $or: [
            { 'personalInfo.firstName': pattern },
            { 'personalInfo.lastName': pattern },
            { email: pattern }
          ]
        }))
      }).select('_id');

      const userIds = matchingUsers.map(u => u._id);

      // Add to filter: either doctorId or patientId matches, or appointmentId matches
      filter.$or = [
        { doctorId: { $in: userIds } },
        { patientId: { $in: userIds } },
        { appointmentId: { $regex: query.search.trim(), $options: 'i' } }
      ];
    }

    if (startDate) filter.appointmentDate = { ...filter.appointmentDate, $gte: new Date(startDate) };
    if (endDate) filter.appointmentDate = { ...filter.appointmentDate, $lte: new Date(endDate) };

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ appointmentDate: -1 })
        .populate('patientId doctorId'),
      Appointment.countDocuments(filter)
    ]);

    return {
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAppointmentById(id) {
    const appointment = await Appointment.findById(id).populate('patientId doctorId');
    if (!appointment) {
      throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
    }
    return appointment;
  }

  async updateAppointment(id, data, updater) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    // Re-check conflict if time changes
    if (data.appointmentDate || data.duration) {
      const checkDate = data.appointmentDate || appointment.appointmentDate;
      const checkDuration = data.duration || appointment.duration || 30;
      const conflict = await this.checkConflict(appointment.doctorId, checkDate, checkDuration, appointment._id);
      if (conflict) {
        throw new AppError('Trùng lịch hẹn', 409, ERROR_CODES.APPOINTMENT_CONFLICT);
      }
    }

    Object.assign(appointment, data, { lastModifiedBy: updater?._id || updater });
    await appointment.save();
    return appointment;
  }

  async cancelAppointment(id, canceller, reason) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    appointment.cancel({
      cancelledBy: canceller?._id || canceller,
      reason,
      notes: appointment.cancellation?.notes || ''
    });
    await appointment.save();
    return appointment;
  }

  async requestCancelAppointment(id, requester, reason) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    if (appointment.cancelRequest?.status === 'PENDING') {
      throw new AppError('Đã có yêu cầu hủy đang chờ xử lý', 409, ERROR_CODES.DUPLICATE_REQUEST);
    }

    appointment.cancelRequest = {
      status: 'PENDING',
      requestedBy: requester?._id || requester,
      requestDate: new Date(),
      reason
    };
    await appointment.save();
    return appointment;
  }

  async approveCancelRequest(id, approver, approved, note) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    if (!appointment.cancelRequest) {
      throw new AppError('Không có yêu cầu hủy để duyệt', 400, ERROR_CODES.CANCEL_REQUEST_NOT_FOUND);
    }

    if (approved) {
      appointment.cancel({
        cancelledBy: approver?._id || approver,
        reason: appointment.cancelRequest.reason,
        notes: note
      });
      appointment.cancelRequest.status = 'APPROVED';
      appointment.cancelRequest.reviewedBy = approver?._id || approver;
      appointment.cancelRequest.reviewDate = new Date();
      appointment.cancelRequest.reviewNotes = note;
    } else {
      appointment.cancelRequest.status = 'DECLINED';
      appointment.cancelRequest.reviewedBy = approver?._id || approver;
      appointment.cancelRequest.reviewDate = new Date();
      appointment.cancelRequest.reviewNotes = note;
    }
    await appointment.save();
    return appointment;
  }

  async rescheduleAppointment(id, newDate, rescheduler) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    const conflict = await this.checkConflict(appointment.doctorId, newDate, appointment.duration || 30, appointment._id);
    if (conflict) {
      throw new AppError('Trùng lịch hẹn', 409, ERROR_CODES.APPOINTMENT_CONFLICT);
    }

    appointment.appointmentDate = newDate;
    appointment.status = 'CONFIRMED';
    appointment.lastModifiedBy = rescheduler?._id || rescheduler;
    await appointment.save();
    return appointment;
  }

  async checkInAppointment(id, checker) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    appointment.status = 'IN_PROGRESS';
    appointment.actualStartTime = new Date();
    appointment.lastModifiedBy = checker?._id || checker;
    await appointment.save();
    return appointment;
  }

  async completeAppointment(id, completer, notes) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    appointment.completeAppointment();
    if (notes) appointment.notes = notes;
    appointment.lastModifiedBy = completer?._id || completer;
    await appointment.save();
    return appointment;
  }

  async noShowAppointment(id, marker, reason) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);

    appointment.markAsNoShow();
    appointment.noShow = {
      reason,
      markedBy: marker?._id || marker,
      markedAt: new Date()
    };
    appointment.lastModifiedBy = marker?._id || marker;
    await appointment.save();
    return appointment;
  }

  async getDoctorAppointments({ doctorId, status, startDate, endDate, page = 1, limit = 10 }) {
    const filter = { doctorId };
    if (status) filter.status = status;
    if (startDate) filter.appointmentDate = { ...filter.appointmentDate, $gte: new Date(startDate) };
    if (endDate) filter.appointmentDate = { ...filter.appointmentDate, $lte: new Date(endDate) };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'personalInfo email phone')
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPatientAppointments({ patientId, status, startDate, endDate, page = 1, limit = 10 }) {
    const filter = { patientId };
    if (status) filter.status = status;
    if (startDate) filter.appointmentDate = { ...filter.appointmentDate, $gte: new Date(startDate) };
    if (endDate) filter.appointmentDate = { ...filter.appointmentDate, $lte: new Date(endDate) };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .populate('doctorId')
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return Appointment.find({ appointmentDate: { $gte: today, $lt: tomorrow } }).populate('patientId doctorId');
  }

  async getUpcomingAppointments(user, days = 30) {
    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + Number(days));

    const filter = { appointmentDate: { $gte: now, $lte: until } };
    if (user?.role === 'DOCTOR') {
      filter.doctorId = user._id;
    }

    return Appointment.find(filter).populate('patientId doctorId');
  }

  async getAvailableSlots(doctorId, date) {
    const workingStart = 8; // 8 AM
    const workingEnd = 17; // 5 PM
    const slotMinutes = 30;

    const targetDate = new Date(date);
    if (Number.isNaN(targetDate.getTime())) {
      throw new AppError('Ngày không hợp lệ', 400, ERROR_CODES.VALIDATION_FAILED);
    }
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const busyAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }
    });

    const busyRanges = busyAppointments.map(appt => {
      const start = new Date(appt.appointmentDate);
      const duration = appt.duration || 30;
      const end = new Date(start.getTime() + duration * 60000);
      return { start, end };
    });

    const slots = [];
    for (let hour = workingStart; hour < workingEnd; hour += slotMinutes / 60) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60000);

      const isBusy = busyRanges.some(range => this.isOverlap(range.start, range.end, slotStart, slotEnd));
      if (!isBusy) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString()
        });
      }
    }

    return slots;
  }

  async getDoctorSchedule(doctorId, date, week) {
    if (date) {
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      const end = new Date(target);
      end.setDate(end.getDate() + (week ? 7 : 1));
      return Appointment.find({
        doctorId,
        appointmentDate: { $gte: target, $lt: end },
        status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }
      }).sort({ appointmentDate: 1 }).populate('patientId');
    }

    // Fallback: return persisted schedule entries if any
    // Note: Schema uses 'doctor' field, not 'doctorId'
    return DoctorSchedule.find({ doctor: doctorId, isActive: true }).sort({ dayOfWeek: 1 });
  }

  async createDoctorSchedule(data, creator) {
    const { doctorId, date, timeSlots } = data;
    const exists = await DoctorSchedule.findOne({ doctorId, date });
    if (exists) {
      throw new AppError('Lịch làm việc đã tồn tại cho ngày này', 409, ERROR_CODES.DUPLICATE_ENTRY);
    }

    const schedule = await DoctorSchedule.create({
      doctorId,
      date,
      timeSlots,
      createdBy: creator?._id || creator
    });

    return schedule;
  }

  async updateDoctorSchedule(id, data, updater) {
    const schedule = await DoctorSchedule.findById(id);
    if (!schedule) {
      throw new AppError('Không tìm thấy lịch làm việc', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
    }

    Object.assign(schedule, data, { updatedBy: updater?._id || updater });
    await schedule.save();
    return schedule;
  }

  async deleteDoctorSchedule(id) {
    const schedule = await DoctorSchedule.findById(id);
    if (!schedule) {
      throw new AppError('Không tìm thấy lịch làm việc', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
    }
    await schedule.deleteOne();
    return true;
  }

  async sendReminder(id) {
    const appointment = await this.getAppointmentById(id);

    const emailService = new EmailService();
    if (appointment.patientId?.email) {
      await emailService.sendMail({
        to: appointment.patientId.email,
        subject: 'Nhắc lịch hẹn khám',
        text: `Bạn có lịch hẹn vào ${new Date(appointment.appointmentDate).toLocaleString('vi-VN')} tại ${appointment.location}`
      });
    }

    appointment.reminders = {
      ...(appointment.reminders || {}),
      emailSent: true,
      reminderDate: new Date()
    };
    await appointment.save();
    return appointment;
  }

  async sendBulkReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: tomorrow, $lt: dayAfter },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    }).populate('patientId doctorId');

    let successful = 0;
    for (const appt of appointments) {
      try {
        await this.sendReminder(appt._id);
        successful++;
      } catch (err) {
        // swallow individual errors to continue bulk processing
        console.error('Reminder failed for appointment', appt._id, err.message);
      }
    }

    return { total: appointments.length, successful };
  }

  async getAppointmentStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [total, byStatus, today] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lt: endOfDay } })
    ]);

    const statusMap = byStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return { total, today, byStatus: statusMap };
  }

  async exportAppointmentsPDF() {
    const appointments = await Appointment.find().populate('patientId doctorId').sort({ appointmentDate: -1 });
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.fontSize(18).text('Danh sách lịch hẹn', { align: 'center' });
    doc.moveDown();

    appointments.forEach((appt, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${appt.appointmentId}`);
      doc.text(`   Bệnh nhân: ${appt.patientId?.personalInfo?.fullName || appt.patientId?.fullName || appt.patientId}`);
      doc.text(`   Bác sĩ: ${appt.doctorId?.personalInfo?.fullName || appt.doctorId?.fullName || appt.doctorId}`);
      doc.text(`   Thời gian: ${new Date(appt.appointmentDate).toLocaleString('vi-VN')}`);
      doc.text(`   Trạng thái: ${appt.status}`);
      doc.moveDown(0.5);
    });

    doc.end();
    return Buffer.concat(buffers);
  }

  async exportAppointmentsExcel() {
    const appointments = await Appointment.find().populate('patientId doctorId').sort({ appointmentDate: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Appointments');
    sheet.columns = [
      { header: 'Mã', key: 'id', width: 20 },
      { header: 'Bệnh nhân', key: 'patient', width: 30 },
      { header: 'Bác sĩ', key: 'doctor', width: 30 },
      { header: 'Thời gian', key: 'time', width: 25 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Loại', key: 'type', width: 15 }
    ];

    appointments.forEach(appt => {
      sheet.addRow({
        id: appt.appointmentId,
        patient: appt.patientId?.personalInfo?.fullName || appt.patientId?.fullName || appt.patientId,
        doctor: appt.doctorId?.personalInfo?.fullName || appt.doctorId?.fullName || appt.doctorId,
        time: new Date(appt.appointmentDate).toLocaleString('vi-VN'),
        status: appt.status,
        type: appt.type
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async getAppointmentAccessLogs(id) {
    return await AuditLog.find({ resourceId: id });
  }

  // ===== Helpers =====
  isOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
  }

  async checkConflict(doctorId, appointmentDate, duration, excludeId = null) {
    const start = new Date(appointmentDate);
    const end = new Date(start.getTime() + (duration || 30) * 60000);

    const conflict = await Appointment.findOne({
      doctorId,
      _id: excludeId ? { $ne: excludeId } : { $exists: true },
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      appointmentDate: {
        $lte: end
      }
    }).lean();

    if (!conflict) return false;

    const existingStart = conflict.appointmentDate;
    const existingEnd = new Date(new Date(conflict.appointmentDate).getTime() + (conflict.duration || 30) * 60000);
    return this.isOverlap(existingStart, existingEnd, start, end);
  }
}

module.exports = new AppointmentService();