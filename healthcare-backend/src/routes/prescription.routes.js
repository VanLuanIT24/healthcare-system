// src/routes/prescription.routes.js
const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/prescription.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

// ===== ĐƠN THUỐC =====

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Tạo đơn thuốc mới
 *     tags: [Prescriptions]
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
 *               - medications
 *             properties:
 *               patientId:
 *                 type: string
 *               appointmentId:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicationId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     instructions:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn thuốc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Prescription'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_CREATE),
  validate(schemas.createPrescription, 'body'),
  prescriptionController.createPrescription
);

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Lấy danh sách đơn thuốc
 *     tags: [Prescriptions]
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
 *           enum: [draft, approved, dispensed, cancelled]
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đơn thuốc
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
 *                     $ref: '#/components/schemas/Prescription'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.getPrescriptions, 'query'),
  prescriptionController.getPrescriptions
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Lấy thông tin đơn thuốc theo ID
 *     tags: [Prescriptions]
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
 *         description: Thông tin đơn thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Prescription'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.getPrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Cập nhật đơn thuốc
 *     tags: [Prescriptions]
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
 *               medications:
 *                 type: array
 *               diagnosis:
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
  '/:id',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_UPDATE_DRAFT),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.updatePrescription, 'body'),
  prescriptionController.updatePrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}/cancel:
 *   patch:
 *     summary: Hủy đơn thuốc
 *     tags: [Prescriptions]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hủy thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/cancel',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_CANCEL),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.cancelPrescription, 'body'),
  prescriptionController.cancelPrescription
);

/**
 * @swagger
 * /api/prescriptions/patients/{patientId}/prescriptions:
 *   get:
 *     summary: Lấy đơn thuốc của bệnh nhân
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đơn thuốc của bệnh nhân
 */
router.get(
  '/patients/:patientId/prescriptions',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientPrescriptions, 'query'),
  prescriptionController.getPatientPrescriptions
);

/**
 * @swagger
 * /api/prescriptions/{id}/print:
 *   get:
 *     summary: In đơn thuốc
 *     tags: [Prescriptions]
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
 *         description: Đơn thuốc PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/:id/print',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.PATIENT),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.printPrescription
);

/**
 * @swagger
 * /api/prescriptions/{id}/approve:
 *   patch:
 *     summary: Duyệt đơn thuốc
 *     tags: [Prescriptions]
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
 *         description: Duyệt thành công
 */
router.patch(
  '/:id/approve',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.PRESCRIPTION_APPROVE),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.approvePrescription
);

// ===== CẤP PHÁT THUỐC =====

/**
 * @swagger
 * /api/prescriptions/{id}/dispense:
 *   post:
 *     summary: Cấp phát thuốc
 *     tags: [Prescriptions]
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
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicationId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Cấp phát thành công
 */
router.post(
  '/:id/dispense',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.PRESCRIPTION_DISPENSE),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.dispenseMedication, 'body'),
  prescriptionController.dispenseMedication
);

/**
 * @swagger
 * /api/prescriptions/{id}/dispense-history:
 *   get:
 *     summary: Lấy lịch sử cấp phát
 *     tags: [Prescriptions]
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
 *         description: Lịch sử cấp phát thuốc
 */
router.get(
  '/:id/dispense-history',
  requireRole(ROLES.PHARMACIST, ROLES.DOCTOR),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.getDispenseHistory
);

// ===== KIỂM TRA AN TOÀN =====

/**
 * @swagger
 * /api/prescriptions/check-interactions:
 *   post:
 *     summary: Kiểm tra tương tác thuốc
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medications
 *             properties:
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra tương tác
 */
router.post(
  '/check-interactions',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.checkDrugInteractions, 'body'),
  prescriptionController.checkDrugInteractions
);

router.post(
  '/patients/:patientId/check-allergies',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.checkPatientAllergies, 'body'),
  prescriptionController.checkPatientAllergies
);

router.get(
  '/medications/:medicationId/dosage-suggestions',
  requireRole(ROLES.DOCTOR),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.getDosageSuggestions, 'query'),
  prescriptionController.getDosageSuggestions
);

// ===== DANH MỤC THUỐC =====
router.get(
  '/medications',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  validate(schemas.getMedications, 'query'),
  prescriptionController.getMedications
);

router.get(
  '/medications/search',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.searchMedications, 'query'),
  prescriptionController.searchMedications
);

router.get(
  '/medications/:id',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.medicationIdParam, 'params'),
  prescriptionController.getMedicationById
);

// ===== CẢNH BÁO =====
router.get(
  '/medications/low-stock',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  prescriptionController.getLowStockAlerts
);

router.get(
  '/medications/expiring',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  validate(schemas.getExpiringMedications, 'query'),
  prescriptionController.getExpiringMedications
);

router.get(
  '/medications/recalls',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  prescriptionController.getRecalledMedications
);

module.exports = router;