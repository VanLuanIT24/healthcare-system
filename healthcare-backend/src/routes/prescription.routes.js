const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { 
  authenticate, 
  requirePermission,
  requireRole 
} = require('../middlewares/auth.middleware');
const { 
  validateBody,
  validateParams 
} = require('../middlewares/validation.middleware');
const prescriptionValidation = require('../validations/prescription.validation');
const {
  createPrescriptionValidation,
  updatePrescriptionValidation,
  dispenseMedicationValidation,
  checkDrugInteractionValidation,
  medicationAdministrationValidation
} = prescriptionValidation;
const { PERMISSIONS, ROLES } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Routes cho bác sĩ
router.post(
  '/patients/:patientId/prescriptions',
  requirePermission(PERMISSIONS['PRESCRIPTION.CREATE']),
  validateBody(createPrescriptionValidation.body),
  prescriptionController.createPrescription
);

router.get(
  '/:prescriptionId',
  requirePermission(PERMISSIONS['PRESCRIPTION.VIEW']),
  prescriptionController.getPrescription
);

router.put(
  '/:prescriptionId',
  requirePermission(PERMISSIONS['PRESCRIPTION.UPDATE']),
  validateBody(updatePrescriptionValidation.body),
  prescriptionController.updatePrescription
);

router.delete(
  '/:prescriptionId/cancel',
  requirePermission(PERMISSIONS['PRESCRIPTION.UPDATE']),
  prescriptionController.cancelPrescription
);

// 🎯 QUẢN LÝ THUỐC TRONG ĐƠN - PRESC-1,2
router.post(
  '/:prescriptionId/medications',
  requirePermission(PERMISSIONS['PRESCRIPTION.UPDATE']),
  validateBody(prescriptionValidation.addMedicationToPrescriptionValidation.body),
  prescriptionController.addMedicationToPrescription
);

router.put(
  '/:prescriptionId/medications/:medicationId',
  requirePermission(PERMISSIONS['PRESCRIPTION.UPDATE']),
  validateBody(prescriptionValidation.updateMedicationInPrescriptionValidation.body),
  prescriptionController.updateMedicationInPrescription
);

// Routes cho dược sĩ
router.post(
  '/:prescriptionId/dispense',
  requirePermission(PERMISSIONS['PRESCRIPTION.DISPENSE']),
  validateBody(dispenseMedicationValidation.body),
  prescriptionController.dispenseMedication
);

router.get(
  '/pharmacy/orders',
  requirePermission(PERMISSIONS['PRESCRIPTION.DISPENSE']),
  prescriptionController.getPharmacyOrders
);

router.patch(
  '/:prescriptionId/dispense-status',
  requirePermission(PERMISSIONS['PRESCRIPTION.DISPENSE']),
  prescriptionController.updateDispenseStatus
);

// Routes cho y tá
router.post(
  '/patients/:patientId/medication-administration',
  requireRole(ROLES.NURSE, ROLES.DOCTOR),
  validateBody(medicationAdministrationValidation.body),
  prescriptionController.recordMedicationAdministration
);

// Routes chung
router.get(
  '/patients/:patientId/prescriptions',
  requirePermission(PERMISSIONS['PRESCRIPTION.VIEW']),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/patients/:patientId/medication-history',
  requirePermission(PERMISSIONS['PRESCRIPTION.VIEW']),
  prescriptionController.getMedicationHistory
);

router.post(
  '/drug-interactions/check',
  requirePermission(PERMISSIONS['PRESCRIPTION.CREATE']),
  validateBody(checkDrugInteractionValidation.body),
  prescriptionController.checkDrugInteraction
);

router.get(
  '/patients/:patientId/medication-coverage/:medicationId',
  requirePermission(PERMISSIONS['PRESCRIPTION.VIEW']),
  prescriptionController.checkMedicationCoverage
);

// Routes quản lý thuốc
router.post(
  '/medications',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  prescriptionController.addMedication
);

router.get(
  '/medications/:medicationId/stock',
  requirePermission(PERMISSIONS['INVENTORY.VIEW']),
  prescriptionController.getMedicationStock
);

router.put(
  '/medications/:medicationId',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  prescriptionController.updateMedication
);

module.exports = router;