// src/routes/medication.routes.js
const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medication.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/medication.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

// ===== DANH MỤC THUỐC =====
router.get(
  '/',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.getMedications, 'query'),
  medicationController.getMedications
);

router.get(
  '/search',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.NURSE),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.searchMedications, 'query'),
  medicationController.searchMedications
);

router.get(
  '/:id',
  requireRole(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_VIEW),
  validate(schemas.medicationIdParam, 'params'),
  medicationController.getMedicationById
);

router.post(
  '/',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_CREATE),
  validate(schemas.createMedication, 'body'),
  medicationController.createMedication
);

router.put(
  '/:id',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.MEDICATION_UPDATE),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.updateMedication, 'body'),
  medicationController.updateMedication
);

// ===== QUẢN LÝ TỒN KHO =====
router.post(
  '/:id/inventory/adjust',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.adjustStock, 'body'),
  medicationController.adjustStock
);

router.post(
  '/:id/inventory/in',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.INVENTORY_RESTOCK),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.restockMedication, 'body'),
  medicationController.restockMedication
);

router.post(
  '/:id/inventory/out',
  requireRole(ROLES.PHARMACIST),
  requirePermission(PERMISSIONS.INVENTORY_WRITEOFF),
  validate(schemas.medicationIdParam, 'params'),
  validate(schemas.writeOffMedication, 'body'),
  medicationController.writeOffMedication
);

// ===== CẢNH BÁO =====
router.get(
  '/alerts/low-stock',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  medicationController.getLowStock
);

router.get(
  '/alerts/expiring',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  validate(schemas.getExpiringSoon, 'query'),
  medicationController.getExpiringSoon
);

router.get(
  '/alerts/recalls',
  requireRole(ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN),
  medicationController.getRecalledMedications
);

// ===== THỐNG KÊ =====
router.get(
  '/inventory/value',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  medicationController.getInventoryValue
);

router.get(
  '/stats/usage',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  validate(schemas.getMedicationUsageStats, 'query'),
  medicationController.getMedicationUsageStats
);

router.get(
  '/inventory/export/excel',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST),
  validate(schemas.exportInventoryExcel, 'query'),
  medicationController.exportInventoryExcel
);

module.exports = router;