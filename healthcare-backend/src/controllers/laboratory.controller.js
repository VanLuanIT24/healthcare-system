// controllers/laboratory.controller.js
const laboratoryService = require('../services/laboratory.service');
const { asyncHandler } = require('../middlewares/error.middleware');

class LaboratoryController {
  // Tạo chỉ định xét nghiệm mới
  createLabOrder = asyncHandler(async (req, res) => {
    const data = req.body;
    const doctorId = req.user._id;
    const labOrder = await laboratoryService.createLabOrder(data, doctorId);
    res.status(201).json({
      success: true,
      message: 'Tạo chỉ định xét nghiệm thành công',
      data: labOrder
    });
  });

  // Lấy thông tin chỉ định xét nghiệm theo ID
  getLabOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const labOrder = await laboratoryService.getLabOrder(id);
    res.json({
      success: true,
      data: labOrder
    });
  });

  // Lấy danh sách chỉ định xét nghiệm
  getLabOrders = asyncHandler(async (req, res) => {
    const params = req.query;
    const labOrders = await laboratoryService.getLabOrders(params);
    res.json({
      success: true,
      data: labOrders
    });
  });

  // Cập nhật chỉ định xét nghiệm
  updateLabOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user._id;
    const labOrder = await laboratoryService.updateLabOrder(id, data, userId);
    res.json({
      success: true,
      message: 'Cập nhật chỉ định xét nghiệm thành công',
      data: labOrder
    });
  });

  // Hủy chỉ định xét nghiệm
  cancelLabOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const labOrder = await laboratoryService.cancelLabOrder(id, reason, userId);
    res.json({
      success: true,
      message: 'Hủy chỉ định xét nghiệm thành công',
      data: labOrder
    });
  });

  // Ghi kết quả xét nghiệm
  recordLabResult = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const results = req.body;
    const technicianId = req.user._id;
    const labOrder = await laboratoryService.recordLabResult(orderId, results, technicianId);
    res.json({
      success: true,
      message: 'Ghi kết quả xét nghiệm thành công',
      data: labOrder
    });
  });

  // Cập nhật kết quả xét nghiệm
  updateLabResult = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const result = req.body;
    const userId = req.user._id;
    const labOrder = await laboratoryService.updateLabResult(orderId, testId, result, userId);
    res.json({
      success: true,
      message: 'Cập nhật kết quả xét nghiệm thành công',
      data: labOrder
    });
  });

  // Duyệt kết quả xét nghiệm
  approveLabResult = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const approverId = req.user._id;
    const labOrder = await laboratoryService.approveLabResult(orderId, testId, approverId);
    res.json({
      success: true,
      message: 'Duyệt kết quả xét nghiệm thành công',
      data: labOrder
    });
  });

  // Đánh dấu mẫu đã được thu thập
  markSampleCollected = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const labOrder = await laboratoryService.markSampleCollected(orderId);
    res.json({
      success: true,
      message: 'Đánh dấu mẫu đã được thu thập thành công',
      data: labOrder
    });
  });

  // Đánh dấu xét nghiệm hoàn thành
  markTestCompleted = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const labOrder = await laboratoryService.markTestCompleted(orderId, testId);
    res.json({
      success: true,
      message: 'Đánh dấu xét nghiệm hoàn thành thành công',
      data: labOrder
    });
  });

  // Lấy danh sách xét nghiệm
  getLabTests = asyncHandler(async (req, res) => {
    const params = req.query;
    const labTests = await laboratoryService.getLabTests(params);
    res.json({
      success: true,
      data: labTests
    });
  });

  // Tìm kiếm xét nghiệm
  searchLabTests = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const labTests = await laboratoryService.searchLabTests(q);
    res.json({
      success: true,
      data: labTests
    });
  });

  // Lấy chỉ định đang chờ xử lý
  getPendingOrders = asyncHandler(async (req, res) => {
    const pendingOrders = await laboratoryService.getPendingOrders();
    res.json({
      success: true,
      data: pendingOrders
    });
  });

  // Lấy kết quả nghiêm trọng
  getCriticalResults = asyncHandler(async (req, res) => {
    const criticalResults = await laboratoryService.getCriticalResults();
    res.json({
      success: true,
      data: criticalResults
    });
  });

  // Lấy thống kê phòng xét nghiệm
  getLabStats = asyncHandler(async (req, res) => {
    const params = req.query;
    const stats = await laboratoryService.getLabStats(params);
    res.json({
      success: true,
      data: stats
    });
  });

  // Xuất báo cáo PDF kết quả xét nghiệm
  exportLabResultsPDF = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const pdf = await laboratoryService.exportLabResultsPDF(orderId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=lab-report-${orderId}.pdf`);
    res.send(pdf);
  });
}

module.exports = new LaboratoryController();