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
  refundPayment,
  voidBill,
  getRevenueStats,
  getAllBills,
  getOutstandingBills
} = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const {
  validateParams,
  validateQuery,
  validateBody
} = require('../middlewares/validation.middleware');
const { billingSchemas } = require('../validations/billing.validation');

// 🎯 ALL ROUTES REQUIRE AUTHENTICATION
router.use(authenticate);

// 🎯 SPECIFIC ROUTES BEFORE DYNAMIC /:id ROUTES (IMPORTANT!)

// 💰 GET ALL BILLS - GET /api/billing
router.get(
  '/',
  requirePermission('BILL.VIEW'),
  validateQuery(billingSchemas.billQuery),
  getAllBills
);

// 💰 GET REVENUE STATS - GET /api/billing/revenue-stats
router.get(
  '/revenue-stats',
  requirePermission('BILL.VIEW_REPORTS'),
  validateQuery(billingSchemas.billQuery),
  getRevenueStats
);

// 💰 GET OUTSTANDING BILLS
router.get(
  '/outstanding',
  requirePermission('BILL.VIEW_REPORTS'),
  validateQuery(billingSchemas.billQuery),
  getOutstandingBills
);

// 💰 CREATE BILL - POST /api/billing
router.post(
  '/',
  requirePermission('BILL.CREATE'),
  validateBody(billingSchemas.createBill),
  createBill
);

// 💰 CREATE BILL FOR PATIENT - POST /api/billing/patient/:patientId
router.post(
  '/patient/:patientId',
  requirePermission('BILL.CREATE'),
  validateParams(billingSchemas.patientId),
  validateBody(billingSchemas.createBill),
  createBill
);

// 💰 GET PATIENT BILLS - GET /api/billing/patient/:patientId
router.get(
  '/patient/:patientId',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.patientId),
  validateQuery(billingSchemas.billQuery),
  getPatientBills
);

// 💰 GET BILL BY ID - GET /api/billing/:billId
router.get(
  '/:billId',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.billId),
  getBill
);

// 💰 UPDATE BILL - PUT /api/billing/:billId
router.put(
  '/:billId',
  requirePermission('BILL.UPDATE'),
  validateParams(billingSchemas.billId),
  validateBody(billingSchemas.updateBill),
  updateBill
);

// 💰 VOID BILL - PATCH /api/billing/:billId/void
router.patch(
  '/:billId/void',
  requirePermission('BILL.UPDATE'),
  validateParams(billingSchemas.billId),
  voidBill
);

// 💰 PROCESS PAYMENT - POST /api/billing/:billId/payment
router.post(
  '/:billId/payment',
  requirePermission('BILL.PROCESS_PAYMENTS'),
  validateParams(billingSchemas.billId),
  validateBody(billingSchemas.processPayment),
  processPayment
);

// 💰 GET PAYMENT HISTORY - GET /api/billing/:billId/payment-history
router.get(
  '/:billId/payment-history',
  requirePermission('BILL.VIEW'),
  validateParams(billingSchemas.billId),
  validateQuery(billingSchemas.paymentQuery),
  getPaymentHistory
);

// 💰 REFUND PAYMENT - POST /api/billing/payments/:paymentId/refund
router.post(
  '/payments/:paymentId/refund',
  requirePermission('BILL.PROCESS_PAYMENTS'),
  validateParams({ paymentId: billingSchemas.billId }),
  validateBody(billingSchemas.refundPayment),
  refundPayment
);

module.exports = router;