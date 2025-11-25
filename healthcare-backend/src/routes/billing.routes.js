// src/routes/billing.routes.js
const express = require('express');
const router = express.Router();
const {
  createBill,
  getBill,
  updateBill,
  getPatientBills,
  processPayment,
  getPaymentHistory,
  voidBill,
  getRevenueStats
} = require('../controllers/billing.controller');
const {
  authenticate,
  requirePermission
} = require('../middlewares/auth.middleware');
const {
  validateParams,
  validateQuery
} = require('../middlewares/validation.middleware');
const { billingSchemas } = require('../validations/billing.validation');

// 🎯 ALL ROUTES REQUIRE AUTHENTICATION
router.use(authenticate);

// 🎯 ROUTES WITH RBAC PERMISSIONS
router.post('/patients/:patientId/bills', 
  requirePermission('BILL.CREATE'),
  validateParams(billingSchemas.patientId),
  createBill
);

router.get('/bills/:billId',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.billId),
  getBill
);

router.put('/bills/:billId',
  requirePermission('BILL.UPDATE'),
  validateParams(billingSchemas.billId),
  updateBill
);

router.get('/patients/:patientId/bills',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.patientId),
  validateQuery(billingSchemas.billQuery),
  getPatientBills
);

router.post('/bills/:billId/payments',
  requirePermission('BILL.PROCESS_PAYMENTS'),
  validateParams(billingSchemas.billId),
  processPayment
);

router.get('/patients/:patientId/payments',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.patientId),
  validateQuery(billingSchemas.paymentQuery),
  getPaymentHistory
);

router.patch('/bills/:billId/void',
  requirePermission('BILL.UPDATE'),
  validateParams(billingSchemas.billId),
  voidBill
);

router.get('/revenue/stats',
  requirePermission('BILL.VIEW_REPORTS'),
  validateQuery(billingSchemas.billQuery),
  getRevenueStats
);

module.exports = router;