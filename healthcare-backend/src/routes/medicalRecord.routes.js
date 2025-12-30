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
router.post(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICAL_CREATE_RECORDS),
  validate(schemas.createMedicalRecord, 'body'),
  medicalRecordController.createMedicalRecord
);

router.get(
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  medicalRecordController.getMedicalRecord
);

router.get(
  '/patient/:patientId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientRecords, 'query'),
  medicalRecordController.getPatientMedicalRecords
);

router.put(
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.recordIdParam, 'params'),
  validate(schemas.updateMedicalRecord, 'body'),
  medicalRecordController.updateMedicalRecord
);

// ===== DẤU HIỆU SINH TỒN =====
router.post(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.recordVitalSigns, 'body'),
  medicalRecordController.recordVitalSigns
);

router.get(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.MEDICAL_VIEW_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getVitalSignsHistory, 'query'),
  medicalRecordController.getVitalSignsHistory
);

// ===== TIỀN SỬ BỆNH LÝ =====
router.post(
  '/patient/:patientId/medical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICAL_UPDATE_RECORDS),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.addMedicalHistory, 'body'),
  medicalRecordController.addMedicalHistory
);

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