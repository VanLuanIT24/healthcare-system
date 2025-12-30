// controllers/bed.controller.js
const bedService = require('../services/bed.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class BedController {
  // Lấy danh sách giường
  getBeds = asyncHandler(async (req, res) => {
    const params = req.query;
    const { beds, total, page, limit } = await bedService.getBeds(params);
    res.json({
      success: true,
      data: beds,
      currentPage: page,
      pageSize: limit,
      total: total
    });
  });

  // Lấy giường theo ID
  getBedById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bed = await bedService.getBedById(id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_VIEW,
      user: req.user,
      metadata: { bedId: id }
    });
    res.json({
      success: true,
      data: bed
    });
  });

  // Lấy danh sách phòng
  getRooms = asyncHandler(async (req, res) => {
    const params = req.query;
    const rooms = await bedService.getRooms(params);
    res.json({
      success: true,
      data: rooms
    });
  });

  // Tạo giường mới
  createBed = asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user._id;
    const bed = await bedService.createBed(data, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_CREATE,
      user: req.user,
      metadata: { bedId: bed._id }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo giường thành công',
      data: bed
    });
  });

  // Tạo phòng mới
  createRoom = asyncHandler(async (req, res) => {
    const data = req.body;
    const createdBy = req.user._id;
    const room = await bedService.createRoom(data, createdBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.ROOM_CREATE,
      user: req.user,
      metadata: { roomId: room._id }
    });
    res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: room
    });
  });

  // Cập nhật trạng thái giường
  updateBedStatus = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    const { status, notes } = req.body;
    const updatedBy = req.user._id;
    const bed = await bedService.updateBedStatus(bedId, status, updatedBy, notes);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_UPDATE,
      user: req.user,
      metadata: { bedId, status }
    });
    res.json({
      success: true,
      message: 'Cập nhật trạng thái giường thành công',
      data: bed
    });
  });

  // Phân bổ giường
  assignBed = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    const { patientId, ...data } = req.body;
    const assignedBy = req.user._id;
    const bed = await bedService.assignBed(bedId, patientId, data, assignedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_ASSIGN,
      user: req.user,
      metadata: { bedId, patientId }
    });
    res.json({
      success: true,
      message: 'Phân bổ giường thành công',
      data: bed
    });
  });

  // Chuyển giường
  transferBed = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    const { newBedId, reason } = req.body;
    const transferredBy = req.user._id;
    const bed = await bedService.transferBed(bedId, newBedId, reason, transferredBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_TRANSFER,
      user: req.user,
      metadata: { fromBedId: bedId, toBedId: newBedId }
    });
    res.json({
      success: true,
      message: 'Chuyển giường thành công',
      data: bed
    });
  });

  // Giải phóng giường
  dischargeFromBed = asyncHandler(async (req, res) => {
    const { bedId } = req.params;
    const data = req.body;
    const dischargedBy = req.user._id;
    const bed = await bedService.dischargeFromBed(bedId, data, dischargedBy);
    await manualAuditLog({
      action: AUDIT_ACTIONS.BED_DISCHARGE,
      user: req.user,
      metadata: { bedId }
    });
    res.json({
      success: true,
      message: 'Giải phóng giường thành công',
      data: bed
    });
  });

  // Lấy tỷ lệ chiếm dụng
  getOccupancyRate = asyncHandler(async (req, res) => {
    const params = req.query;
    const rate = await bedService.getOccupancyRate(params);
    res.json({
      success: true,
      data: rate
    });
  });

  // Lấy giường khả dụng
  getAvailableBeds = asyncHandler(async (req, res) => {
    const params = req.query;
    const beds = await bedService.getAvailableBeds(params);
    res.json({
      success: true,
      data: beds
    });
  });

  // Lấy thống kê giường
  getBedStats = asyncHandler(async (req, res) => {
    const params = req.query;
    const stats = await bedService.getBedStats(params);
    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new BedController();