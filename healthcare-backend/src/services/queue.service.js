// src/services/queue.service.js
const QueueEntry = require('../models/queue.model');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');

const DEFAULT_DURATION = 30; // minutes

class QueueService {
  async getQueue(filters = {}) {
    const { doctorId, departmentId, date, status, type, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (doctorId) query.doctorId = doctorId;
    if (departmentId) query.department = departmentId;
    if (status) query.status = status;
    if (type) query.type = type;

    if (date || filters.today) {
      const targetDate = date ? new Date(date) : new Date();
      const start = new Date(targetDate.setHours(0, 0, 0, 0));
      const end = new Date(targetDate.setHours(23, 59, 59, 999));
      query.queueDate = { $gte: start, $lte: end };
    }

    const [entries, total] = await Promise.all([
      QueueEntry.find(query)
        .populate('patientId', 'personalInfo email phone')
        .populate('doctorId', 'personalInfo professionalInfo')
        .populate('addedBy', 'personalInfo')
        .populate('calledBy', 'personalInfo')
        .sort({ queueNumber: 1, queuedAt: 1 })
        .skip(skip)
        .limit(limit),
      QueueEntry.countDocuments(query)
    ]);

    const summary = await this.getQueueSummary(query);

    return {
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary
    };
  }

  async getTodayQueue(filters) {
    return this.getQueue({ ...filters, today: true });
  }

  async getCurrentPatient(doctorId) {
    return await QueueEntry.findOne({
      doctorId,
      status: { $in: ['CALLED', 'IN_CONSULTATION', 'RECALLED'] }
    })
      .populate('patientId', 'personalInfo email phone')
      .sort({ calledAt: -1 });
  }

  async getQueueSummary(query) {
    const stats = await QueueEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  async addToQueue({ appointmentId, addedBy }) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId doctorId');

    if (!appointment) throw new AppError('Lịch hẹn không tồn tại', 404);
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      throw new AppError('Lịch hẹn không thể thêm vào hàng đợi', 400);
    }

    const existing = await QueueEntry.findOne({ appointmentId });
    if (existing) throw new AppError('Lịch hẹn đã trong hàng đợi', 400);

    const queueNumber = await this.getNextQueueNumber(appointment.doctorId);

    const entry = await QueueEntry.create({
      queueId: `Q-${generateMedicalCode(8)}`,
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      department: appointment.doctorId.professionalInfo?.department,
      queueNumber,
      queueDate: new Date(),
      type: 'APPOINTMENT',
      reason: appointment.reason,
      addedBy,
      status: 'WAITING'
    });

    return entry;
  }

  async addWalkIn({ patientId, doctorId, reason }, addedBy) {
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);
    if (!patient || !doctor) throw new AppError('Không tìm thấy bệnh nhân hoặc bác sĩ', 404);

    const queueNumber = await this.getNextQueueNumber(doctorId);

    const entry = await QueueEntry.create({
      queueId: `Q-${generateMedicalCode(8)}`,
      patientId,
      doctorId,
      department: doctor.professionalInfo?.department,
      queueNumber,
      queueDate: new Date(),
      type: 'WALK_IN',
      reason,
      addedBy,
      status: 'WAITING'
    });

    return entry;
  }

  async getNextQueueNumber(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastEntry = await QueueEntry.findOne({
      doctorId,
      queueDate: { $gte: today, $lt: tomorrow }
    }).sort({ queueNumber: -1 });

    return (lastEntry?.queueNumber || 0) + 1;
  }

  async callNext(doctorId, calledBy) {
    const next = await QueueEntry.findOne({
      doctorId,
      status: 'WAITING'
    }).sort({ queueNumber: 1, queuedAt: 1 });

    if (!next) throw new AppError('Không còn bệnh nhân trong hàng đợi', 404);

    next.status = 'IN_CONSULTATION';
    next.calledAt = new Date();
    next.calledBy = calledBy;
    await next.save();

    if (next.appointmentId) {
      await Appointment.findByIdAndUpdate(next.appointmentId, {
        status: 'IN_PROGRESS',
        actualStartTime: new Date()
      });
    }

    return next.populate('patientId', 'personalInfo email phone');
  }

  async skipPatient(queueId, reason, skippedBy) {
    const entry = await QueueEntry.findById(queueId);
    if (!entry) throw new AppError('Không tìm thấy hàng đợi', 404);
    if (!['WAITING', 'CALLED'].includes(entry.status)) {
      throw new AppError('Chỉ có thể bỏ qua bệnh nhân đang chờ', 400);
    }

    entry.status = 'SKIPPED';
    entry.skippedAt = new Date();
    entry.skippedBy = skippedBy;
    entry.skipReason = reason;
    await entry.save();

    return entry;
  }

  async recallPatient(queueId, recalledBy) {
    const entry = await QueueEntry.findById(queueId);
    if (!entry) throw new AppError('Không tìm thấy hàng đợi', 404);
    if (entry.status !== 'SKIPPED') throw new AppError('Chỉ có thể gọi lại bệnh nhân đã bỏ qua', 400);

    entry.status = 'IN_CONSULTATION';
    entry.lastRecalledAt = new Date();
    entry.recalledBy = recalledBy;
    entry.recallCount = (entry.recallCount || 0) + 1;
    await entry.save();

    return entry;
  }

  async completePatient(queueId, completedBy, notes) {
    const entry = await QueueEntry.findById(queueId);
    if (!entry) throw new AppError('Không tìm thấy hàng đợi', 404);
    if (!['IN_CONS RCT', 'CALLED', 'RECALLED'].includes(entry.status)) {
      throw new AppError('Không thể hoàn thành ở trạng thái này', 400);
    }

    entry.status = 'COMPLETED';
    entry.completedAt = new Date();
    entry.completedBy = completedBy;
    entry.notes = notes;
    await entry.save();

    if (entry.appointmentId) {
      await Appointment.findByIdAndUpdate(entry.appointmentId, {
        status: 'COMPLETED',
        actualEndTime: new Date(),
        notes
      });
    }

    return entry;
  }

  async getQueueStats(filters) {
    const query = this.buildStatsQuery(filters);
    const stats = await QueueEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: { status: '$status', doctorId: '$doctorId' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      }
    ]);

    return { stats, total: stats.reduce((sum, s) => sum + s.count, 0) };
  }

  async getEstimatedWaitTime(doctorId) {
    const waiting = await QueueEntry.countDocuments({
      doctorId,
      status: 'WAITING'
    });

    const avgDuration = await Appointment.aggregate([
      { $match: { doctorId, status: 'COMPLETED' } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);

    const duration = (avgDuration[0]?.avg || DEFAULT_DURATION);
    return { waitingCount: waiting, estimatedMinutes: waiting * duration };
  }

  buildStatsQuery(filters) {
    const query = {};
    if (filters.doctorId) query.doctorId = filters.doctorId;
    if (filters.departmentId) query.department = filters.departmentId;
    if (filters.date) {
      const d = new Date(filters.date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.queueDate = { $gte: start, $lte: end };
    }
    return query;
  }
}

module.exports = new QueueService();