// services/bed.service.js
const Bed = require('../models/bed.model');
const Room = require('../models/room.model');
const Patient = require('../models/patient.model');
const { AppError } = require('../middlewares/error.middleware');
const mongoose = require('mongoose');

class BedService {
  // Lấy danh sách giường với filter và phân trang
  async getBeds(params) {
    const { status, room, ward, page = 1, limit = 20 } = params;
    const query = {};
    if (status) query.status = status.toUpperCase();
    if (room) query.roomNumber = room;
    if (ward) query.ward = ward;

    const beds = await Bed.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('currentPatientRef', 'userId patientId')
      .populate('assignedBy', 'personalInfo')
      .sort({ updatedAt: -1 });

    const total = await Bed.countDocuments(query);

    return { beds, total, page, limit };
  }

  // Lấy giường theo ID
  async getBedById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('ID giường không hợp lệ', 400);
    }
    const bed = await Bed.findById(id)
      .populate('currentPatientRef', 'userId patientId')
      .populate('assignedBy', 'personalInfo')
      .populate('history.patientRef', 'userId patientId');
    if (!bed) {
      throw new AppError('Không tìm thấy giường', 404);
    }
    return bed;
  }

  // Tạo giường mới
  async createBed(data, createdBy) {
    const bed = new Bed({
      ...data,
      createdBy,
      status: 'AVAILABLE'
    });
    await bed.save();
    return bed;
  }

  // Lấy danh sách phòng với filter
  async getRooms(params) {
    const { ward, floor, page = 1, limit = 20 } = params;
    const query = {};
    if (ward) query.ward = ward;
    if (floor) query.floor = floor;

    const rooms = await Room.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('beds')
      .sort({ roomNumber: 1 });

    const total = await Room.countDocuments(query);

    return { rooms, total, page, limit };
  }

  // Tạo phòng mới
  async createRoom(data, createdBy) {
    const room = new Room({
      ...data,
      createdBy
    });
    await room.save();
    return room;
  }

  // Cập nhật trạng thái giường
  async updateBedStatus(bedId, status, updatedBy, notes) {
    const bed = await this.getBedById(bedId);
    bed.status = status.toUpperCase();
    bed.updatedBy = updatedBy;
    bed.lastUpdateNotes = notes;
    await bed.save();
    return bed;
  }

  // Phân bổ giường
  async assignBed(bedId, patientId, data, assignedBy) {
    const bed = await this.getBedById(bedId);
    if (bed.status !== 'AVAILABLE') {
      throw new AppError('Giường không khả dụng', 400);
    }
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new AppError('Không tìm thấy bệnh nhân', 404);
    }
    bed.currentPatientRef = patientId;
    bed.assignedAt = new Date();
    bed.assignedBy = assignedBy;
    bed.status = 'OCCUPIED';
    bed.history.push({
      patientRef: patientId,
      admittedAt: bed.assignedAt,
      notes: data.notes
    });
    await bed.save();
    return bed;
  }

  // Chuyển giường
  async transferBed(bedId, newBedId, reason, transferredBy) {
    const oldBed = await this.getBedById(bedId);
    if (oldBed.status !== 'OCCUPIED') {
      throw new AppError('Giường hiện tại không có bệnh nhân', 400);
    }
    const newBed = await this.getBedById(newBedId);
    if (newBed.status !== 'AVAILABLE') {
      throw new AppError('Giường mới không khả dụng', 400);
    }
    const patientId = oldBed.currentPatientRef;
    oldBed.history[oldBed.history.length - 1].dischargedAt = new Date();
    oldBed.history[oldBed.history.length - 1].notes = `Transferred: ${reason}`;
    oldBed.currentPatientRef = null;
    oldBed.assignedAt = null;
    oldBed.assignedBy = null;
    oldBed.status = 'CLEANING';
    oldBed.updatedBy = transferredBy;

    newBed.currentPatientRef = patientId;
    newBed.assignedAt = new Date();
    newBed.assignedBy = transferredBy;
    newBed.status = 'OCCUPIED';
    newBed.history.push({
      patientRef: patientId,
      admittedAt: newBed.assignedAt,
      notes: `Transferred from ${bedId}: ${reason}`
    });
    newBed.updatedBy = transferredBy;

    await oldBed.save();
    await newBed.save();
    return newBed;
  }

  // Giải phóng giường
  async dischargeFromBed(bedId, data, dischargedBy) {
    const bed = await this.getBedById(bedId);
    if (bed.status !== 'OCCUPIED') {
      throw new AppError('Giường không có bệnh nhân', 400);
    }
    bed.history[bed.history.length - 1].dischargedAt = new Date();
    bed.history[bed.history.length - 1].notes = data.notes || 'Discharged';
    bed.currentPatientRef = null;
    bed.assignedAt = null;
    bed.assignedBy = null;
    bed.status = 'CLEANING';
    bed.updatedBy = dischargedBy;
    await bed.save();
    return bed;
  }

  // Lấy tỷ lệ chiếm dụng
  async getOccupancyRate(params) {
    const totalBeds = await Bed.countDocuments();
    const occupied = await Bed.countDocuments({ status: 'OCCUPIED' });
    return {
      totalBeds,
      occupied,
      rate: (occupied / totalBeds) * 100
    };
  }

  // Lấy giường khả dụng
  async getAvailableBeds(params) {
    return await Bed.find({ status: 'AVAILABLE' }).sort({ bedNumber: 1 });
  }

  // Lấy thống kê giường
  async getBedStats(params) {
    return await Bed.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

module.exports = new BedService();