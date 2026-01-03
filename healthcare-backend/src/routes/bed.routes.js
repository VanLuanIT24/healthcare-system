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

/**
 * @swagger
 * /api/beds/rooms:
 *   get:
 *     summary: Lấy danh sách phòng
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách phòng
 */
// Lấy danh sách phòng (PHẢI TRƯỚC /:id để không bị nhầm)
router.get(
  '/rooms',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getRooms
);

/**
 * @swagger
 * /api/beds:
 *   post:
 *     summary: Tạo giường mới
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bedNumber
 *               - roomId
 *             properties:
 *               bedNumber:
 *                 type: string
 *               roomId:
 *                 type: string
 *               bedType:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo giường thành công
 */
// Tạo giường mới
router.post(
  '/',
  requirePermission(PERMISSIONS['BED_MANAGE']),
  validate(bedValidation.body, 'body'),
  bedController.createBed
);

/**
 * @swagger
 * /api/beds/rooms:
 *   post:
 *     summary: Tạo phòng mới
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomNumber
 *               - department
 *               - floor
 *             properties:
 *               roomNumber:
 *                 type: string
 *               department:
 *                 type: string
 *               floor:
 *                 type: integer
 *               roomType:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 */
// Tạo phòng mới
router.post(
  '/rooms',
  requirePermission(PERMISSIONS['BED_MANAGE']),
  validate(bedValidation.body, 'body'),
  bedController.createRoom
);

/**
 * @swagger
 * /api/beds:
 *   get:
 *     summary: Lấy danh sách giường
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
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
 *     responses:
 *       200:
 *         description: Danh sách giường
 */
// Lấy danh sách giường
router.get(
  '/',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getBeds
);

/**
 * @swagger
 * /api/beds/{id}:
 *   get:
 *     summary: Lấy thông tin giường theo ID
 *     tags: [Beds]
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
 *         description: Thông tin giường
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// Lấy giường theo ID (PHẢI SAU các route cụ thể)
router.get(
  '/:id',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.params, 'params'),
  bedController.getBedById
);

/**
 * @swagger
 * /api/beds/{bedId}/status:
 *   patch:
 *     summary: Cập nhật trạng thái giường
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật trạng thái giường
router.patch(
  '/:bedId/status',
  requirePermission(PERMISSIONS['BED_UPDATE']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.statusBody, 'body'),
  bedController.updateBedStatus
);

/**
 * @swagger
 * /api/beds/{bedId}/assign:
 *   post:
 *     summary: Phân bổ giường cho bệnh nhân
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
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
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *               admissionDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phân bổ thành công
 */
// Phân bổ giường
router.post(
  '/:bedId/assign',
  requirePermission(PERMISSIONS['BED_ASSIGN']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.assignBody, 'body'),
  bedController.assignBed
);

/**
 * @swagger
 * /api/beds/{bedId}/transfer:
 *   patch:
 *     summary: Chuyển bệnh nhân sang giường khác
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
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
 *               - targetBedId
 *             properties:
 *               targetBedId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chuyển giường thành công
 */
// Chuyển giường
router.patch(
  '/:bedId/transfer',
  requirePermission(PERMISSIONS['BED_TRANSFER']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.transferBody, 'body'),
  bedController.transferBed
);

/**
 * @swagger
 * /api/beds/{bedId}/discharge:
 *   patch:
 *     summary: Giải phóng giường (xuất viện)
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dischargeNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giải phóng thành công
 */
// Giải phóng giường
router.patch(
  '/:bedId/discharge',
  requirePermission(PERMISSIONS['BED_DISCHARGE']),
  validate(bedValidation.params, 'params'),
  validate(bedValidation.dischargeBody, 'body'),
  bedController.dischargeFromBed
);

/**
 * @swagger
 * /api/beds/occupancy:
 *   get:
 *     summary: Lấy tỷ lệ chiếm dụng giường
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tỷ lệ chiếm dụng
 */
// Lấy tỷ lệ chiếm dụng
router.get(
  '/occupancy',
  requirePermission(PERMISSIONS['BED_VIEW_STATS']),
  bedController.getOccupancyRate
);

/**
 * @swagger
 * /api/beds/available:
 *   get:
 *     summary: Lấy danh sách giường khả dụng
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomType
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách giường khả dụng
 */
// Lấy giường khả dụng
router.get(
  '/available',
  requirePermission(PERMISSIONS['BED_VIEW']),
  validate(bedValidation.bedQuery, 'query'),
  bedController.getAvailableBeds
);

/**
 * @swagger
 * /api/beds/stats:
 *   get:
 *     summary: Lấy thống kê giường
 *     tags: [Beds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê giường
 */
// Lấy thống kê giường
router.get(
  '/stats',
  requirePermission(PERMISSIONS['BED_VIEW_STATS']),
  bedController.getBedStats
);

module.exports = router;