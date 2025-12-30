// routes/laboratory.routes.js
const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratory.controller');
const {
  authenticate,
  requirePermission,
  requireRole
} = require('../middlewares/auth.middleware');
const {
  validate
} = require('../middlewares/validation.middleware');
const {
  orderLabTestValidation,
  recordLabResultValidation,
  updateLabResultValidation,
  updateLabOrderValidation
} = require('../validations/laboratory.validation');
const { PERMISSIONS, ROLES } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Tạo chỉ định xét nghiệm mới
router.post(
  '/orders',
  requirePermission(PERMISSIONS['LAB_CREATE_ORDERS']),
  validate(orderLabTestValidation.body),
  laboratoryController.createLabOrder
);

// Lấy thông tin chỉ định xét nghiệm theo ID
router.get(
  '/orders/:id',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabOrder
);

// Lấy danh sách chỉ định xét nghiệm
router.get(
  '/orders',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabOrders
);

// Cập nhật chỉ định xét nghiệm
router.put(
  '/orders/:id',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  validate(updateLabOrderValidation.body),
  laboratoryController.updateLabOrder
);

// Hủy chỉ định xét nghiệm
router.patch(
  '/orders/:id/cancel',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  laboratoryController.cancelLabOrder
);

// Ghi kết quả xét nghiệm
router.post(
  '/orders/:orderId/results',
  requirePermission(PERMISSIONS['LAB_CREATE_RESULTS']),
  validate(recordLabResultValidation.body),
  laboratoryController.recordLabResult
);

// Cập nhật kết quả xét nghiệm
router.patch(
  '/orders/:orderId/results/:testId',
  requirePermission(PERMISSIONS['LAB_UPDATE_RESULTS']),
  validate(updateLabResultValidation.body),
  laboratoryController.updateLabResult
);

// Duyệt kết quả xét nghiệm
router.patch(
  '/orders/:orderId/results/:testId/approve',
  requirePermission(PERMISSIONS['LAB_APPROVE_RESULTS']),
  laboratoryController.approveLabResult
);

// Đánh dấu mẫu đã được thu thập
router.patch(
  '/orders/:orderId/sample-collected',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  laboratoryController.markSampleCollected
);

// Đánh dấu xét nghiệm hoàn thành
router.patch(
  '/orders/:orderId/tests/:testId/complete',
  requirePermission(PERMISSIONS['LAB_UPDATE_RESULTS']),
  laboratoryController.markTestCompleted
);

// Lấy danh sách xét nghiệm
router.get(
  '/tests',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabTests
);

// Tìm kiếm xét nghiệm
router.get(
  '/tests/search',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.searchLabTests
);

// Lấy chỉ định đang chờ xử lý
router.get(
  '/orders/pending',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getPendingOrders
);

// Lấy kết quả nghiêm trọng
router.get(
  '/results/critical',
  requirePermission(PERMISSIONS['LAB_VIEW_RESULTS']),
  laboratoryController.getCriticalResults
);

// Lấy thống kê phòng xét nghiệm
router.get(
  '/stats',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabStats
);

// Xuất báo cáo PDF kết quả xét nghiệm
router.get(
  '/orders/:orderId/report/pdf',
  requirePermission(PERMISSIONS['LAB_VIEW_RESULTS']),
  laboratoryController.exportLabResultsPDF
);

module.exports = router;