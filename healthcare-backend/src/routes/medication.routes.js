// src/routes/medication.routes.js
const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medication.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/medication.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

// ===== DANH MỤC THUỐC =====

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: Lấy danh sách thuốc
 *     tags: [Medications]
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
 *         description: Danh sách thuốc
 */
router.get(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.getMedications, 'query'),
  medicationController.getMedications
);

/**
 * @swagger
 * /api/medications/search:
 *   get:
 *     summary: Tìm kiếm thuốc
 *     tags: [Medications]
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
router.get(
  '/search',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.searchMedications, 'query'),
  medicationController.searchMedications
);

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Lấy thông tin thuốc theo ID
 *     tags: [Medications]
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
 *         description: Thông tin thuốc
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.medicationIdParam, 'params'),
  medicationController.getMedicationById
);

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Tạo thuốc mới
 *     tags: [Medications]
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
 *               - genericName
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               dosageForm:
 *                 type: string
 *               strength:
 *                 type: string
 *               unit:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo thuốc thành công
 */
router.post(
  '/',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_CREATE),
  validate(schemas.createMedication, 'body'),
  medicationController.createMedication
);

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     summary: Cập nhật thông tin thuốc
 *     tags: [Medications]
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
 *               genericName:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  '/:id',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_UPDATE),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.updateMedication, 'body'),
  medicationController.updateMedication
);

// ===== QUẢN LÝ TỒN KHO =====

/**
 * @swagger
 * /api/medications/{id}/inventory/adjust:
 *   post:
 *     summary: Điều chỉnh tồn kho thuốc
 *     tags: [Medications]
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
router.post(
  '/:id/inventory/adjust',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.adjustStock, 'body'),
  medicationController.adjustStock
);

/**
 * @swagger
 * /api/medications/{id}/inventory/in:
 *   post:
 *     summary: Nhập kho thuốc
 *     tags: [Medications]
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
router.post(
  '/:id/inventory/in',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.INVENTORY_RESTOCK),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.restockMedication, 'body'),
  medicationController.restockMedication
);

/**
 * @swagger
 * /api/medications/{id}/inventory/out:
 *   post:
 *     summary: Xuất kho thuốc
 *     tags: [Medications]
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
 *         description: Xuất kho thành công
 */
router.post(
  '/:id/inventory/out',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.INVENTORY_WRITEOFF),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.writeOffMedication, 'body'),
  medicationController.writeOffMedication
);

// ===== CẢNH BÁO =====

/**
 * @swagger
 * /api/medications/alerts/low-stock:
 *   get:
 *     summary: Lấy danh sách thuốc sắp hết
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thuốc tồn kho thấp
 */
router.get(
  '/alerts/low-stock',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  medicationController.getLowStock
);

/**
 * @swagger
 * /api/medications/alerts/expiring:
 *   get:
 *     summary: Lấy danh sách thuốc sắp hết hạn
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Số ngày trước khi hết hạn
 *     responses:
 *       200:
 *         description: Danh sách thuốc sắp hết hạn
 */
router.get(
  '/alerts/expiring',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  validate(schemas.getExpiringSoon, 'query'),
  medicationController.getExpiringSoon
);

/**
 * @swagger
 * /api/medications/alerts/recalls:
 *   get:
 *     summary: Lấy danh sách thuốc bị thu hồi
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thuốc bị thu hồi
 */
router.get(
  '/alerts/recalls',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  medicationController.getRecalledMedications
);

// ===== THỐNG KÊ =====

/**
 * @swagger
 * /api/medications/inventory/value:
 *   get:
 *     summary: Lấy tổng giá trị tồn kho
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Giá trị tồn kho
 */
router.get(
  '/inventory/value',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  medicationController.getInventoryValue
);

/**
 * @swagger
 * /api/medications/stats/usage:
 *   get:
 *     summary: Lấy thống kê sử dụng thuốc
 *     tags: [Medications]
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
router.get(
  '/stats/usage',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  validate(schemas.getMedicationUsageStats, 'query'),
  medicationController.getMedicationUsageStats
);

/**
 * @swagger
 * /api/medications/inventory/export/excel:
 *   get:
 *     summary: Xuất báo cáo tồn kho Excel
 *     tags: [Medications]
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
router.get(
  '/inventory/export/excel',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  validate(schemas.exportInventoryExcel, 'query'),
  medicationController.exportInventoryExcel
);

module.exports = router;