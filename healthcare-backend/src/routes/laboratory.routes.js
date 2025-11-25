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
  requirePermission(PERMISSIONS.CREATE_LAB_RESULTS),
  validate(orderLabTestValidation),
  laboratoryController.orderLabTest
);

router.get(
  '/lab-orders/:orderId',
  requirePermission(PERMISSIONS.VIEW_LAB_RESULTS),
  laboratoryController.getLabOrder
);

router.put(
  '/lab-orders/:orderId',
  requirePermission(PERMISSIONS.UPDATE_LAB_RESULTS),
  validate(updateLabOrderValidation),
  laboratoryController.updateLabOrder
);

router.delete(
  '/lab-orders/:orderId/cancel',
  requirePermission(PERMISSIONS.UPDATE_LAB_RESULTS),
  laboratoryController.cancelLabOrder
);

// Routes cho kỹ thuật viên
router.post(
  '/lab-orders/:orderId/results',
  requirePermission(PERMISSIONS.CREATE_LAB_RESULTS),
  validate(recordLabResultValidation),
  laboratoryController.recordLabResult
);

router.patch(
  '/lab-orders/:orderId/results/:testId',
  requirePermission(PERMISSIONS.UPDATE_LAB_RESULTS),
  validate(updateLabResultValidation),
  laboratoryController.updateLabResult
);

router.post(
  '/lab-orders/:orderId/tests/:testId/approve',
  requirePermission(PERMISSIONS.APPROVE_LAB_RESULTS),
  laboratoryController.approveLabResult
);

router.post(
  '/lab-orders/:orderId/tests/:testId/start',
  requirePermission(PERMISSIONS.CREATE_LAB_RESULTS),
  laboratoryController.markTestInProgress
);

router.post(
  '/lab-orders/:orderId/tests/:testId/collect',
  requirePermission(PERMISSIONS.CREATE_LAB_RESULTS),
  laboratoryController.markSampleCollected
);

// Routes chung
router.get(
  '/lab-results/:resultId',
  requirePermission(PERMISSIONS.VIEW_LAB_RESULTS),
  laboratoryController.getLabResult
);

router.get(
  '/patients/:patientId/lab-results',
  requirePermission(PERMISSIONS.VIEW_LAB_RESULTS),
  laboratoryController.getPatientLabResults
);

router.get(
  '/lab-orders',
  requirePermission(PERMISSIONS.VIEW_LAB_RESULTS),
  laboratoryController.getPendingTests
);

router.get(
  '/lab-results',
  requirePermission(PERMISSIONS.VIEW_LAB_RESULTS),
  laboratoryController.getCompletedTests
);

module.exports = router;