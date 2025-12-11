const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratory.controller');
const { 
  authenticate, 
  requirePermission,
  requireRole 
} = require('../middlewares/auth.middleware');
const { 
  validate
} = require('../middlewares/validation.middleware');
const {
  orderLabTestValidation,
  recordLabResultValidation,
  updateLabResultValidation,
  updateLabOrderValidation
} = require('../validations/laboratory.validation');
const { PERMISSIONS, ROLES } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

// Routes cho bác sĩ
router.post(
  '/patients/:patientId/lab-orders',
  requirePermission(PERMISSIONS['LAB.CREATE_ORDERS']),
  validate(orderLabTestValidation.body),
  laboratoryController.orderLabTest
);

router.get(
  '/lab-orders/:orderId',
  requirePermission(PERMISSIONS['LAB.VIEW_ORDERS']),
  laboratoryController.getLabOrder
);

router.put(
  '/lab-orders/:orderId',
  requirePermission(PERMISSIONS['LAB.UPDATE_ORDERS']),
  validate(updateLabOrderValidation.body),
  laboratoryController.updateLabOrder
);

router.delete(
  '/lab-orders/:orderId/cancel',
  requirePermission(PERMISSIONS['LAB.UPDATE_ORDERS']),
  laboratoryController.cancelLabOrder
);

// Routes cho kỹ thuật viên
router.post(
  '/lab-orders/:orderId/results',
  requirePermission(PERMISSIONS['LAB.CREATE_RESULTS']),
  validate(recordLabResultValidation.body),
  laboratoryController.recordLabResult
);

router.patch(
  '/lab-orders/:orderId/results/:testId',
  requirePermission(PERMISSIONS['LAB.UPDATE_RESULTS']),
  validate(updateLabResultValidation.body),
  laboratoryController.updateLabResult
);

router.post(
  '/lab-orders/:orderId/tests/:testId/approve',
  requirePermission(PERMISSIONS['LAB.APPROVE_RESULTS']),
  laboratoryController.approveLabResult
);

router.post(
  '/lab-orders/:orderId/tests/:testId/start',
  requirePermission(PERMISSIONS['LAB.CREATE_RESULTS']),
  laboratoryController.markTestInProgress
);

router.post(
  '/lab-orders/:orderId/tests/:testId/collect',
  requirePermission(PERMISSIONS['LAB.CREATE_RESULTS']),
  laboratoryController.markSampleCollected
);

// Routes chung
router.get(
  '/lab-results/:resultId',
  requirePermission(PERMISSIONS['LAB.VIEW_RESULTS']),
  laboratoryController.getLabResult
);

router.get(
  '/patients/:patientId/lab-results',
  requirePermission(PERMISSIONS['LAB.VIEW_RESULTS']),
  laboratoryController.getPatientLabResults
);

router.get(
  '/lab-orders',
  requirePermission(PERMISSIONS['LAB.VIEW_ORDERS']),
  laboratoryController.getPendingTests
);

router.get(
  '/lab-results',
  requirePermission(PERMISSIONS['LAB.VIEW_RESULTS']),
  laboratoryController.getCompletedTests
);

// Admin dashboard routes (simplified) - Allow SUPER_ADMIN, ADMIN, DOCTOR access
router.get(
  '/orders',
  requireRole('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'),
  laboratoryController.getOrders
);

router.get(
  '/stats',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN']),
  laboratoryController.getStats
);

router.put(
  '/orders/:orderId/result',
  requireRole('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'),
  laboratoryController.updateResult
);

module.exports = router;