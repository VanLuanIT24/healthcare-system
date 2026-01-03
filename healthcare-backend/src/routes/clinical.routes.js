// src/routes/clinical.routes.js
const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinical.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/clinical.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Clinical
 *   description: Quản lý lâm sàng - phiên khám, chẩn đoán, điều trị
 */

/**
 * @swagger
 * /api/clinical/patients/{patientId}/consultations:
 *   post:
 *     summary: Tạo phiên khám mới
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bệnh nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chiefComplaint
 *             properties:
 *               chiefComplaint:
 *                 type: string
 *                 description: Lý do khám chính
 *               appointmentId:
 *                 type: string
 *                 description: ID lịch hẹn (nếu có)
 *     responses:
 *       201:
 *         description: Tạo phiên khám thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
// Tạo phiên khám
router.post(
  '/patients/:patientId/consultations',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS['CONSULTATION_CREATE']),
  validate(schemas.createConsultation, 'body'),
  clinicalController.createConsultation
);

/**
 * @swagger
 * /api/clinical/consultations/{id}:
 *   get:
 *     summary: Lấy thông tin phiên khám theo ID
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiên khám
 *     responses:
 *       200:
 *         description: Thông tin phiên khám
 *       404:
 *         description: Không tìm thấy phiên khám
 */
// Lấy phiên khám theo ID
router.get(
  '/consultations/:id',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['CONSULTATION_VIEW']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.getConsultation
);

/**
 * @swagger
 * /api/clinical/consultations/{id}:
 *   put:
 *     summary: Cập nhật phiên khám
 *     tags: [Clinical]
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
 *               chiefComplaint:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
// Cập nhật phiên khám
router.put(
  '/consultations/:id',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.updateConsultation, 'body'),
  clinicalController.updateConsultation
);

/**
 * @swagger
 * /api/clinical/consultations/{id}/complete:
 *   patch:
 *     summary: Hoàn thành phiên khám
 *     tags: [Clinical]
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
 *         description: Hoàn thành thành công
 */
// Hoàn thành phiên khám
router.patch(
  '/consultations/:id/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.completeConsultation
);

/**
 * @swagger
 * /api/clinical/consultations/{id}/approve:
 *   patch:
 *     summary: Duyệt phiên khám
 *     tags: [Clinical]
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
// Duyệt phiên khám (nếu cần)
router.patch(
  '/consultations/:id/approve',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.approveConsultation
);

/**
 * @swagger
 * /api/clinical/consultations/{consultationId}/symptoms:
 *   post:
 *     summary: Ghi triệu chứng
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
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
 *               - symptoms
 *             properties:
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     severity:
 *                       type: string
 *     responses:
 *       200:
 *         description: Ghi triệu chứng thành công
 */
// Ghi triệu chứng
router.post(
  '/consultations/:consultationId/symptoms',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.recordSymptoms, 'body'),
  clinicalController.recordSymptoms
);

/**
 * @swagger
 * /api/clinical/consultations/{consultationId}/physical-exam:
 *   post:
 *     summary: Ghi khám thực thể
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
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
 *               generalAppearance:
 *                 type: string
 *               systems:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ghi khám thực thể thành công
 */
// Ghi khám thực thể
router.post(
  '/consultations/:consultationId/physical-exam',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.recordPhysicalExam, 'body'),
  clinicalController.recordPhysicalExam
);

/**
 * @swagger
 * /api/clinical/consultations/{consultationId}/diagnoses:
 *   post:
 *     summary: Thêm chẩn đoán
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
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
 *               - icdCode
 *               - description
 *             properties:
 *               icdCode:
 *                 type: string
 *                 description: Mã ICD-10
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [primary, secondary, provisional]
 *     responses:
 *       201:
 *         description: Thêm chẩn đoán thành công
 */
// Thêm chẩn đoán
router.post(
  '/consultations/:consultationId/diagnoses',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['DIAGNOSIS_CREATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.addDiagnosis, 'body'),
  clinicalController.addDiagnosis
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/consultations:
 *   get:
 *     summary: Lấy lịch sử khám của bệnh nhân
 *     tags: [Clinical]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Danh sách phiên khám
 */
// Lấy lịch sử khám của bệnh nhân
router.get(
  '/patients/:patientId/consultations',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['CONSULTATION_VIEW']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientConsultations, 'query'),
  clinicalController.getPatientConsultations
);

/**
 * @swagger
 * /api/clinical/icd10/search:
 *   get:
 *     summary: Tìm kiếm mã ICD-10
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách mã ICD-10 phù hợp
 */
// Tìm mã ICD-10
router.get(
  '/icd10/search',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS['DIAGNOSIS_VIEW']),
  validate(schemas.searchICD10, 'query'),
  clinicalController.searchICD10
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/diagnoses:
 *   get:
 *     summary: Lấy chẩn đoán của bệnh nhân
 *     tags: [Clinical]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách chẩn đoán
 */
// Lấy chẩn đoán của bệnh nhân
router.get(
  '/patients/:patientId/diagnoses',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['DIAGNOSIS_VIEW']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientDiagnoses, 'query'),
  clinicalController.getPatientDiagnoses
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/treatment-plans:
 *   post:
 *     summary: Tạo kế hoạch điều trị
 *     tags: [Clinical]
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
 *             required:
 *               - diagnosisId
 *               - goals
 *             properties:
 *               diagnosisId:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *               interventions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo kế hoạch điều trị thành công
 */
// Tạo kế hoạch điều trị
router.post(
  '/patients/:patientId/treatment-plans',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['TREATMENT_CREATE_PLANS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.createTreatmentPlan, 'body'),
  clinicalController.createTreatmentPlan
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/progress-notes:
 *   post:
 *     summary: Ghi tiến triển điều trị
 *     tags: [Clinical]
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
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *               subjective:
 *                 type: string
 *               objective:
 *                 type: string
 *               assessment:
 *                 type: string
 *               plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ghi tiến triển thành công
 */
// Ghi tiến triển
router.post(
  '/patients/:patientId/progress-notes',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordProgressNote, 'body'),
  clinicalController.recordProgressNote
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/nursing-notes:
 *   post:
 *     summary: Ghi chép điều dưỡng
 *     tags: [Clinical]
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
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *               observations:
 *                 type: string
 *               interventions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ghi chép thành công
 */
// Ghi ghi chép điều dưỡng
router.post(
  '/patients/:patientId/nursing-notes',
  requireRole(ROLES.NURSE),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordNursingNote, 'body'),
  clinicalController.recordNursingNote
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/medical-record:
 *   get:
 *     summary: Lấy hồ sơ y tế bệnh nhân
 *     tags: [Clinical]
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
 *         description: Hồ sơ y tế chi tiết
 */
// Lấy hồ sơ y tế
router.get(
  '/patients/:patientId/medical-record',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  clinicalController.getMedicalRecord
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/medical-record/export/pdf:
 *   get:
 *     summary: Xuất hồ sơ y tế PDF
 *     tags: [Clinical]
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
 *         description: File PDF hồ sơ y tế
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
// Export PDF hồ sơ y tế
router.get(
  '/patients/:patientId/medical-record/export/pdf',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_EXPORT_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  clinicalController.exportMedicalRecordPDF
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/vital-signs:
 *   post:
 *     summary: Ghi dấu hiệu sinh tồn
 *     tags: [Clinical]
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
 *                 description: Nhiệt độ (°C)
 *               bloodPressureSystolic:
 *                 type: number
 *                 description: Huyết áp tâm thu
 *               bloodPressureDiastolic:
 *                 type: number
 *                 description: Huyết áp tâm trương
 *               heartRate:
 *                 type: number
 *                 description: Nhịp tim (bpm)
 *               respiratoryRate:
 *                 type: number
 *                 description: Nhịp thở
 *               oxygenSaturation:
 *                 type: number
 *                 description: SpO2 (%)
 *               weight:
 *                 type: number
 *                 description: Cân nặng (kg)
 *               height:
 *                 type: number
 *                 description: Chiều cao (cm)
 *     responses:
 *       201:
 *         description: Ghi dấu hiệu sinh tồn thành công
 */
// Ghi dấu hiệu sinh tồn
router.post(
  '/patients/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordVitalSigns, 'body'),
  clinicalController.recordVitalSigns
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/vital-signs:
 *   get:
 *     summary: Lấy lịch sử dấu hiệu sinh tồn
 *     tags: [Clinical]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
// Lấy lịch sử dấu hiệu sinh tồn
router.get(
  '/patients/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsHistory, 'query'),
  clinicalController.getVitalSignsHistory
);

/**
 * @swagger
 * /api/clinical/patients/{patientId}/vital-signs/trend:
 *   get:
 *     summary: Lấy xu hướng dấu hiệu sinh tồn
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [temperature, bloodPressure, heartRate, weight]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *     responses:
 *       200:
 *         description: Dữ liệu xu hướng
 */
// Lấy xu hướng dấu hiệu sinh tồn
router.get(
  '/patients/:patientId/vital-signs/trend',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsTrend, 'query'),
  clinicalController.getVitalSignsTrend
);

/**
 * @swagger
 * /api/clinical/clinical/templates:
 *   get:
 *     summary: Lấy danh sách templates lâm sàng
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [consultation, diagnosis, treatment]
 *     responses:
 *       200:
 *         description: Danh sách templates
 */
// Lấy templates lâm sàng
router.get(
  '/clinical/templates',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.getClinicalTemplates, 'query'),
  clinicalController.getClinicalTemplates
);

/**
 * @swagger
 * /api/clinical/clinical/templates:
 *   post:
 *     summary: Lưu template lâm sàng
 *     tags: [Clinical]
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
 *               - type
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               content:
 *                 type: object
 *     responses:
 *       201:
 *         description: Lưu template thành công
 */
// Lưu template lâm sàng
router.post(
  '/clinical/templates',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.saveClinicalTemplate, 'body'),
  clinicalController.saveClinicalTemplate
);

/**
 * @swagger
 * /api/clinical/consultations/{consultationId}/access-logs:
 *   get:
 *     summary: Lấy logs truy cập phiên khám
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logs truy cập
 */
// Lấy logs truy cập phiên khám
router.get(
  '/consultations/:consultationId/access-logs',
  requireRole(ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.getConsultationAccessLogs
);

module.exports = router;