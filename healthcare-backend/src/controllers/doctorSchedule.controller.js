// src/controllers/doctorSchedule.controller.js
const DoctorSchedule = require('../models/doctorSchedule.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { ROLES } = require('../constants/roles');

const doctorScheduleController = {
  /**
   * Tạo lịch làm việc mới
   * POST /api/doctor-schedules
   */
  createSchedule: async (req, res, next) => {
    try {
      const {
        doctorId,
        scheduleType,
        dayOfWeek,
        specificDate,
        startTime,
        endTime,
        breakStart,
        breakEnd,
        slotDuration,
        maxPatientsPerSlot,
        room,
        departmentId,
        consultationType,
        leaveReason,
        effectiveFrom,
        effectiveTo,
        notes
      } = req.body;

      console.log('📅 Creating schedule:', req.body);

      // Validate doctor exists
      const doctor = await User.findOne({
        _id: doctorId,
        role: ROLES.DOCTOR,
        isDeleted: false
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bác sĩ'
        });
      }

      // Check for conflicts
      if (scheduleType === 'REGULAR') {
        const existingRegular = await DoctorSchedule.findOne({
          doctor: doctorId,
          scheduleType: 'REGULAR',
          dayOfWeek: dayOfWeek,
          isActive: true,
          $or: [
            { effectiveTo: null },
            { effectiveTo: { $gte: effectiveFrom || new Date() } }
          ]
        });

        if (existingRegular) {
          // Deactivate old schedule
          existingRegular.isActive = false;
          existingRegular.effectiveTo = new Date();
          await existingRegular.save();
        }
      }

      if (scheduleType === 'SPECIAL' || scheduleType === 'LEAVE') {
        const existingSpecial = await DoctorSchedule.findOne({
          doctor: doctorId,
          scheduleType: { $in: ['SPECIAL', 'LEAVE'] },
          specificDate: new Date(specificDate),
          isActive: true
        });

        if (existingSpecial) {
          return res.status(400).json({
            success: false,
            message: 'Đã có lịch cho ngày này, vui lòng xóa lịch cũ trước'
          });
        }
      }

      const schedule = await DoctorSchedule.create({
        doctor: doctorId,
        scheduleType,
        dayOfWeek: scheduleType === 'REGULAR' ? dayOfWeek : undefined,
        specificDate: scheduleType !== 'REGULAR' ? new Date(specificDate) : undefined,
        startTime,
        endTime,
        breakStart,
        breakEnd,
        slotDuration: slotDuration || 30,
        maxPatientsPerSlot: maxPatientsPerSlot || 1,
        room,
        department: departmentId,
        consultationType: consultationType || 'IN_PERSON',
        leaveReason: scheduleType === 'LEAVE' ? leaveReason : undefined,
        effectiveFrom: effectiveFrom || new Date(),
        effectiveTo,
        notes,
        createdBy: req.user._id
      });

      await schedule.populate('doctor', 'personalInfo email');
      // Chỉ populate department nếu có giá trị
      if (schedule.department) {
        try {
          await schedule.populate('department', 'name code');
        } catch (e) {
          // Ignore populate error
        }
      }

      console.log('✅ Schedule created:', schedule._id);

      res.status(201).json({
        success: true,
        message: 'Tạo lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      next(error);
    }
  },

  /**
   * Lấy danh sách lịch làm việc
   * GET /api/doctor-schedules
   */
  getSchedules: async (req, res, next) => {
    try {
      const {
        doctorId,
        scheduleType,
        startDate,
        endDate,
        isActive,
        page = 1,
        limit = 50
      } = req.query;

      const query = {};

      if (doctorId) query.doctor = doctorId;
      if (scheduleType) query.scheduleType = scheduleType;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      // Date range filter for specific schedules
      if (startDate || endDate) {
        query.specificDate = {};
        if (startDate) query.specificDate.$gte = new Date(startDate);
        if (endDate) query.specificDate.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await DoctorSchedule.countDocuments(query);

      const schedules = await DoctorSchedule.find(query)
        .populate('doctor', 'personalInfo email')
        .populate('createdBy', 'personalInfo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: schedules,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('❌ Error getting schedules:', error);
      next(error);
    }
  },

  /**
   * Lấy lịch làm việc của một bác sĩ
   * GET /api/doctor-schedules/doctor/:doctorId
   */
  getDoctorSchedules: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const { startDate, endDate, includeSlots } = req.query;

      console.log('📅 Getting schedules for doctor:', doctorId);

      // Lấy lịch cố định (REGULAR) - không populate department vì có thể null
      const regularSchedules = await DoctorSchedule.find({
        doctor: doctorId,
        scheduleType: 'REGULAR',
        isActive: true
      }).lean();

      // Lấy lịch đặc biệt và ngày nghỉ trong khoảng thời gian
      const query = {
        doctor: doctorId,
        scheduleType: { $in: ['SPECIAL', 'LEAVE'] },
        isActive: true
      };

      if (startDate || endDate) {
        query.specificDate = {};
        if (startDate) query.specificDate.$gte = new Date(startDate);
        if (endDate) query.specificDate.$lte = new Date(endDate);
      }

      const specialSchedules = await DoctorSchedule.find(query)
        .lean()
        .sort({ specificDate: 1 });

      // Nếu cần tính slots cho từng ngày
      let schedulesWithSlots = [];
      if (includeSlots === 'true' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);

        while (current <= end) {
          const schedule = await DoctorSchedule.getScheduleForDate(doctorId, current);
          const dateStr = current.toISOString().split('T')[0];
          
          let slots = [];
          let bookedSlots = [];
          
          if (schedule && !schedule.isLeave) {
            slots = schedule.getTimeSlots ? schedule.getTimeSlots() : [];
            
            // Lấy các cuộc hẹn đã đặt
            const dayStart = new Date(current);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(current);
            dayEnd.setHours(23, 59, 59, 999);
            
            const appointments = await Appointment.find({
              doctor: doctorId,
              appointmentDate: { $gte: dayStart, $lte: dayEnd },
              status: { $nin: ['CANCELLED', 'NO_SHOW'] }
            }).select('appointmentDate');

            bookedSlots = appointments.map(apt => {
              const date = new Date(apt.appointmentDate);
              return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            });
          }

          schedulesWithSlots.push({
            date: dateStr,
            isLeave: schedule?.isLeave || false,
            leaveReason: schedule?.leaveReason,
            schedule: schedule && !schedule.isLeave ? {
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              breakStart: schedule.breakStart,
              breakEnd: schedule.breakEnd,
              slotDuration: schedule.slotDuration,
              room: schedule.room
            } : null,
            slots,
            bookedSlots,
            availableSlots: slots.filter(s => !bookedSlots.includes(s))
          });

          current.setDate(current.getDate() + 1);
        }
      }

      res.json({
        success: true,
        data: {
          regularSchedules,
          specialSchedules,
          schedulesWithSlots
        }
      });
    } catch (error) {
      console.error('❌ Error getting doctor schedules:', error);
      next(error);
    }
  },

  /**
   * Lấy chi tiết một lịch
   * GET /api/doctor-schedules/:id
   */
  getScheduleById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const schedule = await DoctorSchedule.findById(id)
        .populate('doctor', 'personalInfo email')
        .populate('createdBy', 'personalInfo');

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch làm việc'
        });
      }

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật lịch làm việc
   * PUT /api/doctor-schedules/:id
   */
  updateSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const schedule = await DoctorSchedule.findById(id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch làm việc'
        });
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          schedule[key] = updateData[key];
        }
      });

      schedule.updatedBy = req.user._id;
      await schedule.save();

      await schedule.populate('doctor', 'personalInfo email');

      res.json({
        success: true,
        message: 'Cập nhật lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa lịch làm việc
   * DELETE /api/doctor-schedules/:id
   */
  deleteSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;

      const schedule = await DoctorSchedule.findById(id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch làm việc'
        });
      }

      // Soft delete
      schedule.isActive = false;
      schedule.updatedBy = req.user._id;
      await schedule.save();

      res.json({
        success: true,
        message: 'Xóa lịch làm việc thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo lịch hàng loạt (bulk create)
   * POST /api/doctor-schedules/bulk
   */
  bulkCreateSchedules: async (req, res, next) => {
    try {
      const { doctorId, schedules } = req.body;

      // Validate doctor
      const doctor = await User.findOne({
        _id: doctorId,
        role: ROLES.DOCTOR,
        isDeleted: false
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bác sĩ'
        });
      }

      // Deactivate old regular schedules
      await DoctorSchedule.updateMany(
        { doctor: doctorId, scheduleType: 'REGULAR', isActive: true },
        { isActive: false, effectiveTo: new Date() }
      );

      // Create new schedules
      const schedulesToCreate = schedules.map(s => ({
        doctor: doctorId,
        scheduleType: 'REGULAR',
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        breakStart: s.breakStart,
        breakEnd: s.breakEnd,
        slotDuration: s.slotDuration || 30,
        maxPatientsPerSlot: s.maxPatientsPerSlot || 1,
        room: s.room,
        department: s.departmentId,
        consultationType: s.consultationType || 'IN_PERSON',
        effectiveFrom: new Date(),
        isActive: true,
        createdBy: req.user._id
      }));

      const createdSchedules = await DoctorSchedule.insertMany(schedulesToCreate);

      res.status(201).json({
        success: true,
        message: `Đã tạo ${createdSchedules.length} lịch làm việc`,
        data: createdSchedules
      });
    } catch (error) {
      console.error('❌ Error bulk creating schedules:', error);
      next(error);
    }
  },

  /**
   * Lấy slots khả dụng cho một ngày
   * GET /api/doctor-schedules/available-slots/:doctorId/:date
   */
  getAvailableSlots: async (req, res, next) => {
    try {
      const { doctorId, date } = req.params;

      console.log('📅 Getting available slots for:', doctorId, date);

      const schedule = await DoctorSchedule.getScheduleForDate(doctorId, date);

      if (!schedule) {
        return res.json({
          success: true,
          data: {
            date,
            isWorking: false,
            message: 'Bác sĩ không làm việc ngày này',
            slots: []
          }
        });
      }

      if (schedule.isLeave) {
        return res.json({
          success: true,
          data: {
            date,
            isWorking: false,
            isLeave: true,
            leaveReason: schedule.reason,
            message: 'Bác sĩ nghỉ ngày này',
            slots: []
          }
        });
      }

      // Get all slots
      const allSlots = schedule.getTimeSlots();

      // Get booked appointments
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ['CANCELLED', 'NO_SHOW'] }
      }).select('appointmentDate');

      const bookedTimes = bookedAppointments.map(apt => {
        const d = new Date(apt.appointmentDate);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      });

      // Filter available slots
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

      res.json({
        success: true,
        data: {
          date,
          isWorking: true,
          schedule: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            breakStart: schedule.breakStart,
            breakEnd: schedule.breakEnd,
            slotDuration: schedule.slotDuration,
            room: schedule.room
          },
          totalSlots: allSlots.length,
          bookedSlots: bookedTimes.length,
          slots: allSlots.map(slot => ({
            time: slot,
            isAvailable: !bookedTimes.includes(slot)
          })),
          availableSlots
        }
      });
    } catch (error) {
      console.error('❌ Error getting available slots:', error);
      next(error);
    }
  }
};

module.exports = doctorScheduleController;
