const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { 
  authenticate, 
  requirePermission,
  requireRole 
} = require('../middlewares/auth.middleware');
const { 
  validate,
  validateParams 
} = require('../middlewares/validation.middleware');
const {
  createPrescriptionValidation,
  updatePrescriptionValidation,
  dispenseMedicationValidation,
  checkDrugInteractionValidation,
  medicationAdministrationValidation
} = require('../validations/prescription.validation');
const { PERMISSIONS, ROLES } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Routes cho bác sĩ
router.post(
  '/patients/:patientId/prescriptions',
  requirePermission(PERMISSIONS.CREATE_PRESCRIPTIONS),
  validate(createPrescriptionValidation),
  prescriptionController.createPrescription
);

router.get(
  '/prescriptions/:prescriptionId',
  requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
  prescriptionController.getPrescription
);

router.put(
  '/prescriptions/:prescriptionId',
  requirePermission(PERMISSIONS.UPDATE_PRESCRIPTIONS),
  validate(updatePrescriptionValidation),
  prescriptionController.updatePrescription
);

router.delete(
  '/prescriptions/:prescriptionId/cancel',
  requirePermission(PERMISSIONS.UPDATE_PRESCRIPTIONS),
  prescriptionController.cancelPrescription
);

// Routes cho dược sĩ
router.post(
  '/prescriptions/:prescriptionId/dispense',
  requirePermission(PERMISSIONS.DISPENSE_MEDICATION),
  validate(dispenseMedicationValidation),
  prescriptionController.dispenseMedication
);

router.get(
  '/pharmacy/orders',
  requirePermission(PERMISSIONS.DISPENSE_MEDICATION),
  prescriptionController.getPharmacyOrders
);

router.patch(
  '/prescriptions/:prescriptionId/dispense-status',
  requirePermission(PERMISSIONS.DISPENSE_MEDICATION),
  prescriptionController.updateDispenseStatus
);

// Routes cho y tá
router.post(
  '/patients/:patientId/medication-administration',
  requireRole([ROLES.NURSE, ROLES.DOCTOR]),
  validate(medicationAdministrationValidation),
  prescriptionController.recordMedicationAdministration
);

// Routes chung
router.get(
  '/patients/:patientId/prescriptions',
  requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/patients/:patientId/medication-history',
  requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
  prescriptionController.getMedicationHistory
);

router.post(
  '/drug-interactions/check',
  requirePermission(PERMISSIONS.CREATE_PRESCRIPTIONS),
  validate(checkDrugInteractionValidation),
  prescriptionController.checkDrugInteraction
);

router.get(
  '/patients/:patientId/medication-coverage/:medicationId',
  requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
  prescriptionController.checkMedicationCoverage
);

// Routes quản lý thuốc
router.post(
  '/medications',
  requireRole([ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN]),
  prescriptionController.addMedication
);

router.get(
  '/medications/:medicationId/stock',
  requirePermission(PERMISSIONS.VIEW_INVENTORY),
  prescriptionController.getMedicationStock
);

router.put(
  '/medications/:medicationId',
  requireRole([ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN]),
  prescriptionController.updateMedication
);

module.exports = router;