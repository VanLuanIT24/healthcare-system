const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinical.controller');
const clinicalValidation = require('../validations/clinical.validation');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const { 
  requireRole, 
  requirePermission, 
  requirePatientDataAccess,
  requireModuleAccess 
} = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * 🩺 CLINICAL ROUTES
 * Quản lý tất cả endpoints liên quan đến khám chữa bệnh
 */

// APPLY AUTH MIDDLEWARE CHO TẤT CẢ ROUTES
router.use(authenticate);

// 🎯 TẠO PHIÊN KHÁM BỆNH
router.post(
  '/patient/:patientId/doctor/:doctorId/consultations',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS['MEDICAL.CREATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateBody(clinicalValidation.createConsultation),
  clinicalController.createConsultation
);

// 🎯 LẤY THÔNG TIN PHIÊN KHÁM
router.get(
  '/consultations/:consultationId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['MEDICAL.VIEW_RECORDS']),
  clinicalController.getConsultation
);

// 🎯 CẬP NHẬT PHIÊN KHÁM
router.put(
  '/consultations/:consultationId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  validateBody(clinicalValidation.updateConsultation),
  clinicalController.updateConsultation
);

// 🎯 THÊM CHẨN ĐOÁN
router.post(
  '/consultations/:consultationId/diagnoses',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['DIAGNOSIS.CREATE']),
  validateBody(clinicalValidation.addDiagnosis),
  clinicalController.addDiagnosis
);

// 🎯 LẤY DANH SÁCH CHẨN ĐOÁN
router.get(
  '/patient/:patientId/diagnoses',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['MEDICAL.VIEW_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateQuery(clinicalValidation.getPatientDiagnoses),
  clinicalController.getPatientDiagnoses
);

// 🎯 GHI NHẬN TRIỆU CHỨNG
router.post(
  '/consultations/:consultationId/symptoms',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  validateBody(clinicalValidation.recordSymptoms),
  clinicalController.recordSymptoms
);

// 🎯 GHI KẾT QUẢ KHÁM THỰC THỂ
router.post(
  '/consultations/:consultationId/physical-exam',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  validateBody(clinicalValidation.recordPhysicalExam),
  clinicalController.recordPhysicalExam
);

// 🎯 HOÀN THÀNH PHIÊN KHÁM
router.post(
  '/consultations/:consultationId/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  clinicalController.completeConsultation
);

// 🎯 CẬP NHẬT CHẨN ĐOÁN
router.put(
  '/diagnoses/:diagnosisId',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['DIAGNOSIS.UPDATE']),
  validateBody(clinicalValidation.updateDiagnosis),
  clinicalController.updateDiagnosis
);

// 🎯 TẠO KẾ HOẠCH ĐIỀU TRỊ
router.post(
  '/patient/:patientId/treatment-plans',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['TREATMENT.CREATE_PLANS']),
  requirePatientDataAccess('patientId'),
  validateBody(clinicalValidation.createTreatmentPlan),
  clinicalController.createTreatmentPlan
);

// 🎯 LẤY THÔNG TIN KẾ HOẠCH ĐIỀU TRỊ
router.get(
  '/treatment-plans/:planId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['TREATMENT.VIEW_PLANS']),
  clinicalController.getTreatmentPlan
);

// 🎯 GHI NHẬN TIẾN TRIỂN
router.post(
  '/patient/:patientId/progress-notes',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateBody(clinicalValidation.recordProgressNote),
  clinicalController.recordProgressNote
);

// 🎯 CẬP NHẬT KẾ HOẠCH ĐIỀU TRỊ
router.put(
  '/treatment-plans/:planId',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['TREATMENT.UPDATE_PLANS']),
  validateBody(clinicalValidation.updateTreatmentPlan),
  clinicalController.updateTreatmentPlan
);

// 🎯 HOÀN THÀNH ĐIỀU TRỊ
router.post(
  '/treatment-plans/:planId/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['TREATMENT.UPDATE_PLANS']),
  clinicalController.completeTreatmentPlan
);

// 🎯 LẤY NHẬN XÉT TIẾN TRIỂN
router.get(
  '/patient/:patientId/progress-notes',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS['MEDICAL.VIEW_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateQuery(clinicalValidation.getProgressNotes),
  clinicalController.getProgressNotes
);

// 🎯 GHI NHẬN CỦA ĐIỀU DƯỠNG
router.post(
  '/patient/:patientId/nursing-notes',
  requireRole(ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateBody(clinicalValidation.recordNursingNote),
  clinicalController.recordNursingNote
);

// 🎯 GHI TÓM TẮT XUẤT VIỆN
router.post(
  '/patient/:patientId/discharge-summary',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS['MEDICAL.UPDATE_RECORDS']),
  requirePatientDataAccess('patientId'),
  validateBody(clinicalValidation.recordDischargeSummary),
  clinicalController.recordDischargeSummary
);

module.exports = router;