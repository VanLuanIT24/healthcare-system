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

// Tạo phiên khám
router.post(
  '/patients/:patientId/consultations',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS['CONSULTATION_CREATE']),
  validate(schemas.createConsultation, 'body'),
  clinicalController.createConsultation
);

// Lấy phiên khám theo ID
router.get(
  '/consultations/:id',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['CONSULTATION_VIEW']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.getConsultation
);

// Cập nhật phiên khám
router.put(
  '/consultations/:id',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.updateConsultation, 'body'),
  clinicalController.updateConsultation
);

// Hoàn thành phiên khám
router.patch(
  '/consultations/:id/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.completeConsultation
);

// Duyệt phiên khám (nếu cần)
router.patch(
  '/consultations/:id/approve',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.approveConsultation
);

// Ghi triệu chứng
router.post(
  '/consultations/:consultationId/symptoms',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.recordSymptoms, 'body'),
  clinicalController.recordSymptoms
);

// Ghi khám thực thể
router.post(
  '/consultations/:consultationId/physical-exam',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['CONSULTATION_UPDATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.recordPhysicalExam, 'body'),
  clinicalController.recordPhysicalExam
);

// Thêm chẩn đoán
router.post(
  '/consultations/:consultationId/diagnoses',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['DIAGNOSIS_CREATE']),
  validate(schemas.consultationIdParam, 'params'),
  validate(schemas.addDiagnosis, 'body'),
  clinicalController.addDiagnosis
);

// Lấy lịch sử khám của bệnh nhân
router.get(
  '/patients/:patientId/consultations',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['CONSULTATION_VIEW']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientConsultations, 'query'),
  clinicalController.getPatientConsultations
);

// Tìm mã ICD-10
router.get(
  '/icd10/search',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS['DIAGNOSIS_VIEW']),
  validate(schemas.searchICD10, 'query'),
  clinicalController.searchICD10
);

// Lấy chẩn đoán của bệnh nhân
router.get(
  '/patients/:patientId/diagnoses',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['DIAGNOSIS_VIEW']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientDiagnoses, 'query'),
  clinicalController.getPatientDiagnoses
);

// Tạo kế hoạch điều trị
router.post(
  '/patients/:patientId/treatment-plans',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['TREATMENT_CREATE_PLANS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.createTreatmentPlan, 'body'),
  clinicalController.createTreatmentPlan
);

// Ghi tiến triển
router.post(
  '/patients/:patientId/progress-notes',
  requireRole(ROLES.DOCTOR),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordProgressNote, 'body'),
  clinicalController.recordProgressNote
);

// Ghi ghi chép điều dưỡng
router.post(
  '/patients/:patientId/nursing-notes',
  requireRole(ROLES.NURSE),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordNursingNote, 'body'),
  clinicalController.recordNursingNote
);

// Lấy hồ sơ y tế
router.get(
  '/patients/:patientId/medical-record',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  clinicalController.getMedicalRecord
);

// Export PDF hồ sơ y tế
router.get(
  '/patients/:patientId/medical-record/export/pdf',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_EXPORT_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  clinicalController.exportMedicalRecordPDF
);

// Ghi dấu hiệu sinh tồn
router.post(
  '/patients/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordVitalSigns, 'body'),
  clinicalController.recordVitalSigns
);

// Lấy lịch sử dấu hiệu sinh tồn
router.get(
  '/patients/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsHistory, 'query'),
  clinicalController.getVitalSignsHistory
);

// Lấy xu hướng dấu hiệu sinh tồn
router.get(
  '/patients/:patientId/vital-signs/trend',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsTrend, 'query'),
  clinicalController.getVitalSignsTrend
);

// Lấy templates lâm sàng
router.get(
  '/clinical/templates',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_VIEW_RECORDS']),
  validate(schemas.getClinicalTemplates, 'query'),
  clinicalController.getClinicalTemplates
);

// Lưu template lâm sàng
router.post(
  '/clinical/templates',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['MEDICAL_UPDATE_RECORDS']),
  validate(schemas.saveClinicalTemplate, 'body'),
  clinicalController.saveClinicalTemplate
);

// Lấy logs truy cập phiên khám
router.get(
  '/consultations/:consultationId/access-logs',
  requireRole(ROLES.HOSPITAL_ADMIN),
   requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(schemas.consultationIdParam, 'params'),
  clinicalController.getConsultationAccessLogs
);

module.exports = router;