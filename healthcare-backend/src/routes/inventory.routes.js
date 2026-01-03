// routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const {
  authenticate,
  requirePermission
} = require('../middlewares/auth.middleware');
const {
  validate
} = require('../middlewares/validation.middleware');
const {
  inventoryValidation
} = require('../validations/inventory.validation');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

/**
 * @swagger
 * /api/inventory/items:
 *   get:
 *     summary: Lấy danh sách vật tư
 *     tags: [Inventory]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách vật tư
 */
// Lấy danh sách vật tư
router.get(
  '/items',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.query, 'query'),
  inventoryController.getItems
);

/**
 * @swagger
 * /api/inventory/items/search:
 *   get:
 *     summary: Tìm kiếm vật tư
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 */
// Tìm kiếm vật tư
router.get(
  '/items/search',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.query, 'query'),
  inventoryController.searchItems
);

/**
 * @swagger
 * /api/inventory/items/{id}:
 *   get:
 *     summary: Lấy thông tin vật tư theo ID
 *     tags: [Inventory]
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
 *         description: Thông tin vật tư
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// Lấy vật tư theo ID
router.get(
  '/items/:id',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.params, 'params'),
  inventoryController.getItemById
);

/**
 * @swagger
 * /api/inventory/items:
 *   post:
 *     summary: Tạo vật tư mới
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               reorderLevel:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo vật tư thành công
 */
// Tạo vật tư mới
router.post(
  '/items',
  requirePermission(PERMISSIONS['INVENTORY_CREATE']),
  validate(inventoryValidation.body, 'body'),
  inventoryController.createItem
);

/**
 * @swagger
 * /api/inventory/items/{id}:
 *   put:
 *     summary: Cập nhật thông tin vật tư
 *     tags: [Inventory]
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
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật vật tư
router.put(
  '/items/:id',
  requirePermission(PERMISSIONS['INVENTORY_UPDATE']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.updateBody, 'body'),
  inventoryController.updateItem
);

/**
 * @swagger
 * /api/inventory/items/{id}/adjust:
 *   post:
 *     summary: Điều chỉnh tồn kho
 *     tags: [Inventory]
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
 *             required:
 *               - quantity
 *               - reason
 *             properties:
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Điều chỉnh thành công
 */
// Điều chỉnh tồn kho
router.post(
  '/items/:id/adjust',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.adjustBody, 'body'),
  inventoryController.adjustStock
);

/**
 * @swagger
 * /api/inventory/items/{id}/receive:
 *   post:
 *     summary: Nhập kho vật tư
 *     tags: [Inventory]
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *               batchNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               supplier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nhập kho thành công
 */
// Nhập kho
router.post(
  '/items/:id/receive',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.receiveBody, 'body'),
  inventoryController.receiveStock
);

/**
 * @swagger
 * /api/inventory/items/{id}/issue:
 *   post:
 *     summary: Xuất kho vật tư
 *     tags: [Inventory]
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
 *             required:
 *               - quantity
 *               - reason
 *             properties:
 *               quantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *               issuedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xuất kho thành công
 */
// Xuất kho
router.post(
  '/items/:id/issue',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.issueBody, 'body'),
  inventoryController.issueStock
);

/**
 * @swagger
 * /api/inventory/alerts/low-stock:
 *   get:
 *     summary: Lấy cảnh báo tồn kho thấp
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách vật tư tồn kho thấp
 */
// Lấy cảnh báo tồn kho thấp
router.get(
  '/alerts/low-stock',
  requirePermission(PERMISSIONS['INVENTORY_ALERTS']),
  inventoryController.getLowStockAlerts
);

/**
 * @swagger
 * /api/inventory/alerts/expiring:
 *   get:
 *     summary: Lấy cảnh báo vật tư sắp hết hạn
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Danh sách vật tư sắp hết hạn
 */
// Lấy cảnh báo hết hạn
router.get(
  '/alerts/expiring',
  requirePermission(PERMISSIONS['INVENTORY_ALERTS']),
  validate(inventoryValidation.expiringQuery, 'query'),
  inventoryController.getExpiringAlerts
);

/**
 * @swagger
 * /api/inventory/value:
 *   get:
 *     summary: Lấy tổng giá trị tồn kho
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Giá trị tồn kho
 */
// Lấy giá trị tồn kho
router.get(
  '/value',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  inventoryController.getInventoryValue
);

/**
 * @swagger
 * /api/inventory/stats/usage:
 *   get:
 *     summary: Lấy thống kê sử dụng vật tư
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Thống kê sử dụng
 */
// Lấy thống kê sử dụng
router.get(
  '/stats/usage',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.statsQuery, 'query'),
  inventoryController.getUsageStats
);

/**
 * @swagger
 * /api/inventory/export/excel:
 *   get:
 *     summary: Xuất báo cáo tồn kho Excel
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File Excel tồn kho
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
// Xuất Excel
router.get(
  '/export/excel',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  inventoryController.exportInventoryExcel
);

module.exports = router;