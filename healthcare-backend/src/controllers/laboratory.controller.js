const laboratoryService = require('../services/laboratory.service');
const { asyncHandler } = require('../middlewares/error.middleware');

class LaboratoryController {
  
  // Chỉ định xét nghiệm cho bệnh nhân
  orderLabTest = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const testData = req.body;
    const doctorId = req.user._id;

    const labOrder = await laboratoryService.orderLabTest(
      patientId, 
      testData, 
      doctorId
    );

    res.status(201).json({
      success: true,
      message: 'Chỉ định xét nghiệm thành công',
      data: labOrder
    });
  });

  // Lấy thông tin chỉ định xét nghiệm
  getLabOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const labOrder = await laboratoryService.getLabOrder(orderId);

    res.json({
      success: true,
      data: labOrder
    });
  });

  // Ghi kết quả xét nghiệm
  recordLabResult = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const resultData = req.body;
    const technicianId = req.user._id;

    const labOrder = await laboratoryService.recordLabResult(
      orderId,
      resultData,
      technicianId
    );

    res.json({
      success: true,
      message: 'Ghi kết quả xét nghiệm thành công',
      data: labOrder
    });
  });

  // Lấy kết quả xét nghiệm theo ID
  getLabResult = asyncHandler(async (req, res) => {
    const { resultId } = req.params;

    const result = await laboratoryService.getLabResult(resultId);

    res.json({
      success: true,
      data: result
    });
  });

  // Lấy tất cả kết quả XN của bệnh nhân
  getPatientLabResults = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { page, limit, startDate, endDate, category } = req.query;

    const result = await laboratoryService.getPatientLabResults(patientId, {
      page, limit, startDate, endDate, category
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Lấy danh sách xét nghiệm đang chờ xử lý
  getPendingTests = asyncHandler(async (req, res) => {
    const { page, limit, department, priority } = req.query;

    const result = await laboratoryService.getPendingTests({
      page, limit, department, priority
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Cập nhật thông tin chỉ định XN
  updateLabOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const labOrder = await laboratoryService.updateLabOrder(
      orderId, 
      updateData, 
      userId
    );

    res.json({
      success: true,
      message: 'Cập nhật chỉ định thành công',
      data: labOrder
    });
  });

  // Hủy chỉ định xét nghiệm
  cancelLabOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const labOrder = await laboratoryService.cancelLabOrder(
      orderId,
      reason,
      userId
    );

    res.json({
      success: true,
      message: 'Hủy chỉ định thành công',
      data: labOrder
    });
  });

  // Cập nhật kết quả xét nghiệm (sửa lỗi)
  updateLabResult = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const labOrder = await laboratoryService.updateLabResult(
      orderId,
      testId,
      updateData,
      userId
    );

    res.json({
      success: true,
      message: 'Cập nhật kết quả thành công',
      data: labOrder
    });
  });

  // Duyệt kết quả xét nghiệm
  approveLabResult = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const approverId = req.user._id;

    const labOrder = await laboratoryService.approveLabResult(
      orderId,
      testId,
      approverId
    );

    res.json({
      success: true,
      message: 'Duyệt kết quả thành công',
      data: labOrder
    });
  });

  // Lấy xét nghiệm đã hoàn thành trong khoảng thời gian
  getCompletedTests = asyncHandler(async (req, res) => {
    const { timeframe } = req.query;
    const { page, limit, department } = req.query;

    const result = await laboratoryService.getCompletedTests(timeframe, {
      page, limit, department
    });

    res.json({
      success: true,
      data: result
    });
  });

  // Đánh dấu test đang được thực hiện
  markTestInProgress = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const technicianId = req.user._id;

    const labOrder = await laboratoryService.markTestInProgress(
      orderId,
      testId,
      technicianId
    );

    res.json({
      success: true,
      message: 'Đã bắt đầu thực hiện xét nghiệm',
      data: labOrder
    });
  });

  // Đánh dấu đã thu thập mẫu
  markSampleCollected = asyncHandler(async (req, res) => {
    const { orderId, testId } = req.params;
    const collectorId = req.user._id;

    const labOrder = await laboratoryService.markSampleCollected(
      orderId,
      testId,
      collectorId
    );

    res.json({
      success: true,
      message: 'Đã thu thập mẫu thành công',
      data: labOrder
    });
  });
}

module.exports = new LaboratoryController();