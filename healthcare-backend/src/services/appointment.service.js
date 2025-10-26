const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');

/**
 * 📅 APPOINTMENT SERVICE - BUSINESS LOGIC
 * Xử lý tất cả nghiệp vụ liên quan đến lịch hẹn
 */

class AppointmentService {
  
  /**
   * 🎯 TẠO LỊCH HẸN MỚI
   */
  async createAppointment(appointmentData) {
    try {
      console.log('📅 [SERVICE] Creating appointment');

      // 🎯 KIỂM TRA BÁC SĨ TỒN TẠI VÀ CÓ PHẢI LÀ DOCTOR
      const doctor = await User.findOne({ 
        _id: appointmentData.doctorId, 
        role: 'DOCTOR',
        isActive: true 
      });
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 KIỂM TRA BỆNH NHÂN TỒN TẠI
      const patient = await User.findOne({ 
        _id: appointmentData.patientId, 
        role: 'PATIENT',
        isActive: true 
      });
      
      if (!patient) {
        throw new AppError('Không tìm thấy bệnh nhân', 404, ERROR_CODES.PATIENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA TRÙNG LỊCH
      const conflictingAppointment = await Appointment.findOne({
        doctorId: appointmentData.doctorId,
        appointmentDate: {
          $gte: new Date(appointmentData.appointmentDate),
          $lt: new Date(new Date(appointmentData.appointmentDate).getTime() + (appointmentData.duration || 30) * 60000)
        },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] }
      });

      if (conflictingAppointment) {
        throw new AppError('Bác sĩ đã có lịch hẹn trong khoảng thời gian này', 400, ERROR_CODES.APPOINTMENT_CONFLICT);
      }

      // 🎯 TẠO APPOINTMENT ID
      const appointmentId = `AP${generateMedicalCode(8)}`;

      // 🎯 TẠO APPOINTMENT
      const appointment = new Appointment({
        ...appointmentData,
        appointmentId,
        status: 'SCHEDULED'
      });

      await appointment.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email phone dateOfBirth gender')
        .populate('doctorId', 'name email phone specialization')
        .populate('createdBy', 'name email');

      console.log('✅ [SERVICE] Appointment created successfully:', appointmentId);
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Appointment creation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN
   */
  async getPatientAppointments({ patientId, status, page, limit, startDate, endDate }) {
    try {
      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { patientId };
      
      if (status) {
        query.status = status;
      }

      if (startDate && endDate) {
        query.appointmentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone')
          .populate('doctorId', 'name email specialization')
          .sort({ appointmentDate: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get patient appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ
   */
  async getDoctorAppointments({ doctorId, status, page, limit, date }) {
    try {
      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { doctorId };
      
      if (status) {
        query.status = status;
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone dateOfBirth gender')
          .populate('doctorId', 'name email specialization')
          .sort({ appointmentDate: 1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get doctor appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN LỊCH HẸN CHI TIẾT
   */
  async getAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone dateOfBirth gender address')
        .populate('doctorId', 'name email phone specialization department')
        .populate('createdBy', 'name email')
        .populate('cancellation.cancelledBy', 'name email');

      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      return appointment;

    } catch (error) {
      console.error('❌ [SERVICE] Get appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT LỊCH HẸN
   */
  async updateAppointment(appointmentId, updateData, updatedBy) {
    try {
      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA TRẠNG THÁI CÓ THỂ UPDATE
      if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
        throw new AppError('Không thể cập nhật lịch hẹn đã kết thúc hoặc đã hủy', 400, ERROR_CODES.APPOINTMENT_CANNOT_UPDATE);
      }

      // 🎯 CẬP NHẬT THÔNG TIN
      const allowedFields = ['appointmentDate', 'duration', 'type', 'mode', 'location', 'room', 'reason', 'description', 'symptoms', 'preparationInstructions'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          appointment[field] = updateData[field];
        }
      });

      await appointment.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const updatedAppointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone dateOfBirth gender')
        .populate('doctorId', 'name email specialization')
        .populate('createdBy', 'name email');

      console.log('✅ [SERVICE] Appointment updated:', appointmentId);
      return updatedAppointment;

    } catch (error) {
      console.error('❌ [SERVICE] Update appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 HỦY LỊCH HẸN
   */
  async cancelAppointment(appointmentId, cancelledBy, reason, notes = '') {
    try {
      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA CÓ THỂ HỦY
      if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
        throw new AppError('Lịch hẹn đã kết thúc hoặc đã hủy', 400, ERROR_CODES.APPOINTMENT_CANNOT_CANCEL);
      }

      // 🎯 HỦY LỊCH HẸN
      appointment.cancel(cancelledBy, reason, notes);
      await appointment.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const cancelledAppointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email specialization')
        .populate('cancellation.cancelledBy', 'name email');

      console.log('✅ [SERVICE] Appointment cancelled:', appointmentId);
      return cancelledAppointment;

    } catch (error) {
      console.error('❌ [SERVICE] Cancel appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO LỊCH LÀM VIỆC
   */
  async createSchedule(scheduleData) {
    try {
      // 🎯 KIỂM TRA BÁC SĨ
      const doctor = await User.findOne({ 
        _id: scheduleData.doctorId, 
        role: 'DOCTOR',
        isActive: true 
      });
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 TẠO SCHEDULE SLOTS
      const { date, startTime, endTime, slotDuration = 30, breaks = [] } = scheduleData;
      
      const scheduleSlots = this.generateTimeSlots(date, startTime, endTime, slotDuration, breaks);
      
      // 🎯 LƯU SCHEDULE (trong thực tế có thể dùng model Schedule riêng)
      // Ở đây tạm return schedule structure
      
      const schedule = {
        doctorId: scheduleData.doctorId,
        date: new Date(date),
        slots: scheduleSlots,
        createdBy: scheduleData.createdBy,
        createdAt: new Date()
      };

      console.log('✅ [SERVICE] Schedule created for doctor:', scheduleData.doctorId);
      return schedule;

    } catch (error) {
      console.error('❌ [SERVICE] Create schedule failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH LÀM VIỆC
   */
  async getDoctorSchedule(doctorId, date, week) {
    try {
      let query = { doctorId, status: { $in: ['SCHEDULED', 'CONFIRMED'] } };
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      } else if (week) {
        const startOfWeek = new Date(week);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfWeek,
          $lte: endOfWeek
        };
      }

      const appointments = await Appointment.find(query)
        .populate('patientId', 'name email phone')
        .sort({ appointmentDate: 1 });

      // 🎯 NHÓM THEO NGÀY
      const scheduleByDate = {};
      appointments.forEach(appointment => {
        const dateKey = appointment.appointmentDate.toISOString().split('T')[0];
        if (!scheduleByDate[dateKey]) {
          scheduleByDate[dateKey] = [];
        }
        scheduleByDate[dateKey].push(appointment);
      });

      return {
        doctorId,
        period: date || week,
        schedule: scheduleByDate,
        totalAppointments: appointments.length
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get doctor schedule failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO TIME SLOTS CHO SCHEDULE
   */
  generateTimeSlots(date, startTime, endTime, slotDuration, breaks) {
    const slots = [];
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);
      
      // 🎯 KIỂM TRA CÓ NẰM TRONG BREAK KHÔNG
      const isInBreak = breaks.some(breakTime => {
        const breakStart = new Date(`${date}T${breakTime.start}`);
        const breakEnd = new Date(`${date}T${breakTime.end}`);
        return current < breakEnd && slotEnd > breakStart;
      });
      
      if (!isInBreak && slotEnd <= end) {
        slots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          duration: slotDuration,
          available: true
        });
      }
      
      current = slotEnd;
    }
    
    return slots;
  }
}

module.exports = new AppointmentService();