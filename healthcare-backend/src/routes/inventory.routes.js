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

// Lấy danh sách vật tư
router.get(
  '/items',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.query, 'query'),
  inventoryController.getItems
);

// Tìm kiếm vật tư
router.get(
  '/items/search',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.query, 'query'),
  inventoryController.searchItems
);

// Lấy vật tư theo ID
router.get(
  '/items/:id',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.params, 'params'),
  inventoryController.getItemById
);

// Tạo vật tư mới
router.post(
  '/items',
  requirePermission(PERMISSIONS['INVENTORY_CREATE']),
  validate(inventoryValidation.body, 'body'),
  inventoryController.createItem
);

// Cập nhật vật tư
router.put(
  '/items/:id',
  requirePermission(PERMISSIONS['INVENTORY_UPDATE']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.updateBody, 'body'),
  inventoryController.updateItem
);

// Điều chỉnh tồn kho
router.post(
  '/items/:id/adjust',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.adjustBody, 'body'),
  inventoryController.adjustStock
);

// Nhập kho
router.post(
  '/items/:id/receive',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.receiveBody, 'body'),
  inventoryController.receiveStock
);

// Xuất kho
router.post(
  '/items/:id/issue',
  requirePermission(PERMISSIONS['INVENTORY_ADJUST']),
  validate(inventoryValidation.params, 'params'),
  validate(inventoryValidation.issueBody, 'body'),
  inventoryController.issueStock
);

// Lấy cảnh báo tồn kho thấp
router.get(
  '/alerts/low-stock',
  requirePermission(PERMISSIONS['INVENTORY_ALERTS']),
  inventoryController.getLowStockAlerts
);

// Lấy cảnh báo hết hạn
router.get(
  '/alerts/expiring',
  requirePermission(PERMISSIONS['INVENTORY_ALERTS']),
  validate(inventoryValidation.expiringQuery, 'query'),
  inventoryController.getExpiringAlerts
);

// Lấy giá trị tồn kho
router.get(
  '/value',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  inventoryController.getInventoryValue
);

// Lấy thống kê sử dụng
router.get(
  '/stats/usage',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  validate(inventoryValidation.statsQuery, 'query'),
  inventoryController.getUsageStats
);

// Xuất Excel
router.get(
  '/export/excel',
  requirePermission(PERMISSIONS['INVENTORY_VIEW']),
  inventoryController.exportInventoryExcel
);

module.exports = router;