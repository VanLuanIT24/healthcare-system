const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const medicalRecordValidation = require('../validations/medicalRecord.validation');
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
 * 🏥 MEDICAL RECORD ROUTES
 * Quản lý tất cả endpoints liên quan đến hồ sơ bệnh án
 */

// APPLY AUTH MIDDLEWARE CHO TẤT CẢ ROUTES
router.use(authenticate);

// 🎯 TÌM KIẾM HỒ SƠ THEO CHẨN ĐOÁN - MUST BE BEFORE /:recordId
router.get(
  '/search',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  medicalRecordController.searchMedicalRecordsByDiagnosis
);

// 🎯 THỐNG KÊ HỒ SƠ BỆNH ÁN - MUST BE BEFORE /:recordId
router.get(
  '/stats',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  medicalRecordController.getMedicalRecordsStats
);

// 🎯 TẠO HỒ SƠ BỆNH ÁN
router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS['MEDICAL.CREATE_RECORDS']),
  validateBody(medicalRecordValidation.createMedicalRecord),
  medicalRecordController.createMedicalRecord
);

// 🎯 LẤY THÔNG TIN HỒ SƠ BỆNH ÁN
router.get(
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  medicalRecordController.getMedicalRecord
);

// 🎯 LẤY TẤT CẢ HỒ SƠ BỆNH ÁN CỦA BỆNH NHÂN
router.get(
  '/patient/:patientId',
  requireRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT),
  requirePermission(PERMISSIONS['MEDICAL.VIEW_RECORDS']),
  validateQuery(medicalRecordValidation.getPatientMedicalRecords),
  medicalRecordController.getPatientMedicalRecords
);

// 🎯 CẬP NHẬT HỒ SƠ BỆNH ÁN
router.put(
  '/:recordId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  validateBody(medicalRecordValidation.updateMedicalRecord),
  medicalRecordController.updateMedicalRecord
);

// 🎯 GHI NHẬN DẤU HIỆU SINH TỒN
router.post(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  validateBody(medicalRecordValidation.recordVitalSigns),
  medicalRecordController.recordVitalSigns
);

// 🎯 LẤY LỊCH SỬ DẤU HIỆU SINH TỒN - MR-3
router.get(
  '/patient/:patientId/vital-signs',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getVitalSignsHistory
);

// 🎯 THÊM TIỀN SỬ BỆNH LÝ
router.post(
  '/patient/:patientId/medical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  validateBody(medicalRecordValidation.addMedicalHistory),
  medicalRecordController.addMedicalHistory
);

// 🎯 LẤY TOÀN BỘ TIỀN SỬ BỆNH LÝ
router.get(
  '/patient/:patientId/medical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getMedicalHistory
);

// 🎯 THÊM TIỀN SỬ PHẪU THUẬT - MR-6
router.post(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.addSurgicalHistory
);

// 🎯 LẤY TIỀN SỬ PHẪU THUẬT - MR-7
router.get(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getSurgicalHistory
);

// 🎯 LẤY TIỀN SỬ SẢN KHOA - MR-8
router.get(
  '/patient/:patientId/obstetric-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getObstetricHistory
);

// 🎯 GHI NHẬN PHÁT HIỆN LÂM SÀNG - MR-9
router.post(
  '/:recordId/clinical-findings',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  medicalRecordController.recordClinicalFindings
);

// 🎯 LƯU TRỮ HỒ SƠ BỆNH ÁN
router.post(
  '/:recordId/archive',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  medicalRecordController.archiveMedicalRecord
);

module.exports = router;