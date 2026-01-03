// src/routes/medicalRecord.routes.js
const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/medicalRecord.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

// ===== TẠO & QUẢN LÝ HỒ SƠ BỆNH ÁN =====

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Tạo hồ sơ bệnh án mới
 *     tags: [Medical Records]
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
 *               - chiefComplaint
 *             properties:
 *               patientId:
 *                 type: string
 *               appointmentId:
 *                 type: string
 *               chiefComplaint:
 *                 type: string
 *               presentIllness:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               treatmentPlan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo hồ sơ thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_CREATE_RECORDS),
  validate(schemas.createMedicalRecord, 'body'),
  medicalRecordController.createMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/{recordId}:
 *   get:
 *     summary: Lấy hồ sơ bệnh án theo ID
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin hồ sơ bệnh án
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  medicalRecordController.getMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/patient/{patientId}:
 *   get:
 *     summary: Lấy tất cả hồ sơ bệnh án của bệnh nhân
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Danh sách hồ sơ bệnh án
 */
router.get(
  '/patient/:patientId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientRecords, 'query'),
  medicalRecordController.getPatientMedicalRecords
);

/**
 * @swagger
 * /api/medical-records/{recordId}:
 *   put:
 *     summary: Cập nhật hồ sơ bệnh án
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
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
 *               diagnosis:
 *                 type: string
 *               treatmentPlan:
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
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  validate(schemas.updateMedicalRecord, 'body'),
  medicalRecordController.updateMedicalRecord
);

// ===== DẤU HIỆU SINH TỒN =====

/**
 * @swagger
 * /api/medical-records/patient/{patientId}/vital-signs:
 *   post:
 *     summary: Ghi nhận dấu hiệu sinh tồn
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
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
 *               temperature:
 *                 type: number
 *                 example: 36.5
 *               bloodPressure:
 *                 type: object
 *                 properties:
 *                   systolic:
 *                     type: number
 *                   diastolic:
 *                     type: number
 *               heartRate:
 *                 type: number
 *               respiratoryRate:
 *                 type: number
 *               oxygenSaturation:
 *                 type: number
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ghi nhận thành công
 */
router.post(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordVitalSigns, 'body'),
  medicalRecordController.recordVitalSigns
);

/**
 * @swagger
 * /api/medical-records/patient/{patientId}/vital-signs:
 *   get:
 *     summary: Lấy lịch sử dấu hiệu sinh tồn
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Lịch sử dấu hiệu sinh tồn
 */
router.get(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsHistory, 'query'),
  medicalRecordController.getVitalSignsHistory
);

// ===== TIỀN SỬ BỆNH LÝ =====

/**
 * @swagger
 * /api/medical-records/patient/{patientId}/medical-history:
 *   post:
 *     summary: Thêm tiền sử bệnh lý
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
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
 *               condition:
 *                 type: string
 *               diagnosedDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, resolved, chronic]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post(
  '/patient/:patientId/medical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.addMedicalHistory, 'body'),
  medicalRecordController.addMedicalHistory
);

/**
 * @swagger
 * /api/medical-records/patient/{patientId}/medical-history:
 *   get:
 *     summary: Lấy tiền sử bệnh lý
 *     tags: [Medical Records]
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
 *         description: Tiền sử bệnh lý
 */
router.get(
  '/patient/:patientId/medical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  medicalRecordController.getMedicalHistory
);

// ===== LỊCH SỬ PHẪU THUẬT =====
router.post(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.addSurgicalHistory, 'body'),
  medicalRecordController.addSurgicalHistory
);

router.get(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  medicalRecordController.getSurgicalHistory
);

// ===== TIỀN SỬ SẢN KHOA =====
router.get(
  '/patient/:patientId/obstetric-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  medicalRecordController.getObstetricHistory
);

// ===== PHÁT HIỆN LÂM SÀNG =====
router.post(
  '/:recordId/clinical-findings',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  validate(schemas.recordClinicalFindings, 'body'),
  medicalRecordController.recordClinicalFindings
);

// ===== LƯU TRỮ HỒ SƠ =====
router.post(
  '/:recordId/archive',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  medicalRecordController.archiveMedicalRecord
);

// ===== TÌM KIẾM THEO CHẨN ĐOÁN =====
router.get(
  '/search/diagnosis',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.searchByDiagnosis, 'query'),
  medicalRecordController.searchMedicalRecordsByDiagnosis
);

// ===== THỐNG KÊ =====
router.get(
  '/stats',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.getStats, 'query'),
  medicalRecordController.getMedicalRecordsStats
);

module.exports = router;