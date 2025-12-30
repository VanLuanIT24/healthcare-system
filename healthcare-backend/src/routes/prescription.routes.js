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
router.post(
  '/',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_CREATE),
  validate(schemas.createPrescription, 'body'),
  prescriptionController.createPrescription
);

router.get(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.getPrescriptions, 'query'),
  prescriptionController.getPrescriptions
);

router.get(
  '/:id',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.getPrescription
);

router.put(
  '/:id',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_UPDATE_DRAFT),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.updatePrescription, 'body'),
  prescriptionController.updatePrescription
);

router.patch(
  '/:id/cancel',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.PRESCRIPTION_CANCEL),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.cancelPrescription, 'body'),
  prescriptionController.cancelPrescription
);

router.get(
  '/patients/:patientId/prescriptions',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.PRESCRIPTION_VIEW),
  validate(schemas.patientIdParam, 'params'),
  validate(schemas.getPatientPrescriptions, 'query'),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/:id/print',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.printPrescription
);

router.patch(
  '/:id/approve',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.PRESCRIPTION_APPROVE),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.approvePrescription
);

// ===== CẤP PHÁT THUỐC =====
router.post(
  '/:id/dispense',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.PRESCRIPTION_DISPENSE),
  validate(schemas.prescriptionIdParam, 'params'),
  validate(schemas.dispenseMedication, 'body'),
  prescriptionController.dispenseMedication
);

router.get(
  '/:id/dispense-history',
  requireRole(ROLES.PHARMACIST, ROLES.DOCTOR),
  validate(schemas.prescriptionIdParam, 'params'),
  prescriptionController.getDispenseHistory
);

// ===== KIỂM TRA AN TOÀN =====
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