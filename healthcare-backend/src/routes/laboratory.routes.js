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

/**
 * @swagger
 * /api/laboratory/orders:
 *   post:
 *     summary: Tạo chỉ định xét nghiệm mới
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - tests
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               tests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testId:
 *                       type: string
 *                     testName:
 *                       type: string
 *               priority:
 *                 type: string
 *                 enum: [normal, urgent, stat]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo chỉ định thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LabOrder'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/orders',
  requirePermission(PERMISSIONS['LAB_CREATE_ORDERS']),
  validate(orderLabTestValidation.body),
  laboratoryController.createLabOrder
);

/**
 * @swagger
 * /api/laboratory/orders/{id}:
 *   get:
 *     summary: Lấy thông tin chỉ định xét nghiệm theo ID
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chỉ định xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LabOrder'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/orders/:id',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabOrder
);

/**
 * @swagger
 * /api/laboratory/orders:
 *   get:
 *     summary: Lấy danh sách chỉ định xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [normal, urgent, stat]
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách chỉ định xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LabOrder'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/orders',
  requirePermission(PERMISSIONS['LAB_VIEW_ORDERS']),
  laboratoryController.getLabOrders
);

/**
 * @swagger
 * /api/laboratory/orders/{id}:
 *   put:
 *     summary: Cập nhật chỉ định xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tests:
 *                 type: array
 *               priority:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/orders/:id',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  validate(updateLabOrderValidation.body),
  laboratoryController.updateLabOrder
);

/**
 * @swagger
 * /api/laboratory/orders/{id}/cancel:
 *   patch:
 *     summary: Hủy chỉ định xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hủy thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/orders/:id/cancel',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  laboratoryController.cancelLabOrder
);

/**
 * @swagger
 * /api/laboratory/orders/{orderId}/results:
 *   post:
 *     summary: Ghi kết quả xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testId
 *               - result
 *             properties:
 *               testId:
 *                 type: string
 *               result:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ghi kết quả thành công
 */
router.post(
  '/orders/:orderId/results',
  requirePermission(PERMISSIONS['LAB_CREATE_RESULTS']),
  validate(recordLabResultValidation.body),
  laboratoryController.recordLabResult
);

/**
 * @swagger
 * /api/laboratory/orders/{orderId}/results/{testId}:
 *   patch:
 *     summary: Cập nhật kết quả xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch(
  '/orders/:orderId/results/:testId',
  requirePermission(PERMISSIONS['LAB_UPDATE_RESULTS']),
  validate(updateLabResultValidation.body),
  laboratoryController.updateLabResult
);

/**
 * @swagger
 * /api/laboratory/orders/{orderId}/results/{testId}/approve:
 *   patch:
 *     summary: Duyệt kết quả xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Duyệt thành công
 */
router.patch(
  '/orders/:orderId/results/:testId/approve',
  requirePermission(PERMISSIONS['LAB_APPROVE_RESULTS']),
  laboratoryController.approveLabResult
);

/**
 * @swagger
 * /api/laboratory/orders/{orderId}/sample-collected:
 *   patch:
 *     summary: Đánh dấu mẫu đã được thu thập
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 */
router.patch(
  '/orders/:orderId/sample-collected',
  requirePermission(PERMISSIONS['LAB_UPDATE_ORDERS']),
  laboratoryController.markSampleCollected
);

/**
 * @swagger
 * /api/laboratory/orders/{orderId}/tests/{testId}/complete:
 *   patch:
 *     summary: Đánh dấu xét nghiệm hoàn thành
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 */
router.patch(
  '/orders/:orderId/tests/:testId/complete',
  requirePermission(PERMISSIONS['LAB_UPDATE_RESULTS']),
  laboratoryController.markTestCompleted
);

/**
 * @swagger
 * /api/laboratory/tests:
 *   get:
 *     summary: Lấy danh sách các loại xét nghiệm
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách xét nghiệm
 */
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