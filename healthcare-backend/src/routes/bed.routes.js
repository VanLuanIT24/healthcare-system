// routes/bed.routes.js
const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bed.controller');
const {
  authenticate,
  requirePermission
} = require('../middlewares/auth.middleware');
const {
  validate
} = require('../middlewares/validation.middleware');
const {
  bedValidation
} = require('../validations/bed.validation');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Lấy danh sách phòng (PHẢI TRƯỚC /:id để không bị nhầm)
router.get(
  '/rooms',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getRooms
);

// Tạo giường mới
router.post(
  '/',
  requirePermission(PERMISSIONS['BED_MANAGE']),
  validate(bedValidation.body, 'body'),
  bedController.createBed
);

// Tạo phòng mới
router.post(
  '/rooms',
  requirePermission(PERMISSIONS['BED_MANAGE']),
  validate(bedValidation.body, 'body'),
  bedController.createRoom
);

// Lấy danh sách giường
router.get(
  '/',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getBeds
);

// Lấy giường theo ID (PHẢI SAU các route cụ thể)
router.get(
  '/:id',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.params, 'params'),
  bedController.getBedById
);

// Cập nhật trạng thái giường
router.patch(
  '/:bedId/status',
  requirePermission(PERMISSIONS['BED_UPDATE']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.statusBody, 'body'),
  bedController.updateBedStatus
);

// Phân bổ giường
router.post(
  '/:bedId/assign',
  requirePermission(PERMISSIONS['BED_ASSIGN']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.assignBody, 'body'),
  bedController.assignBed
);

// Chuyển giường
router.patch(
  '/:bedId/transfer',
  requirePermission(PERMISSIONS['BED_TRANSFER']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.transferBody, 'body'),
  bedController.transferBed
);

// Giải phóng giường
router.patch(
  '/:bedId/discharge',
  requirePermission(PERMISSIONS['BED_DISCHARGE']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.dischargeBody, 'body'),
  bedController.dischargeFromBed
);

// Lấy tỷ lệ chiếm dụng
router.get(
  '/occupancy',
  requirePermission(PERMISSIONS['BED_VIEW_STATS']),
  bedController.getOccupancyRate
);

// Lấy giường khả dụng
router.get(
  '/available',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getAvailableBeds
);

// Lấy thống kê giường
router.get(
  '/stats',
  requirePermission(PERMISSIONS['BED_VIEW_STATS']),
  bedController.getBedStats
);

module.exports = router;