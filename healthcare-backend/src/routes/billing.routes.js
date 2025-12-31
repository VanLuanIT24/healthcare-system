// routes/billing.routes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { validateBilling } = require('../validations/billing.validation');
const { PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

// Tạo hóa đơn mới
router.post(
  '/',
  requirePermission(PERMISSIONS['BILL_CREATE']),
  (req, res, next) => {
    const { error } = validateBilling.createBill(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.createBill
);

// Lấy thông tin hóa đơn theo ID
router.get(
  '/:billId',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getBill
);

// Lấy danh sách hóa đơn
router.get(
  '/',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  (req, res, next) => {
    const { error } = validateBilling.billQuery(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.getBills
);

// Cập nhật hóa đơn
router.put(
  '/:billId',
  requirePermission(PERMISSIONS['BILL_UPDATE']),
  (req, res, next) => {
    const { error } = validateBilling.updateBill(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.updateBill
);

// Hủy hóa đơn
router.patch(
  '/:billId/void',
  requirePermission(PERMISSIONS['BILL_UPDATE']),
  (req, res, next) => {
    const { error } = validateBilling.voidBill(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.voidBill
);

// Xử lý thanh toán
router.post(
  '/:billId/payment',
  requirePermission(PERMISSIONS['BILL_PROCESS_PAYMENTS']),
  (req, res, next) => {
    const { error } = validateBilling.processPayment(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.processPayment
);

// Lấy lịch sử thanh toán
router.get(
  '/:billId/payment-history',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getPaymentHistory
);

// Hoàn tiền
router.post(
  '/payments/:paymentId/refund',
  requirePermission(PERMISSIONS['BILL_PROCESS_PAYMENTS']),
  (req, res, next) => {
    const { error } = validateBilling.refundPayment(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.refundPayment
);

// Lấy hóa đơn của bệnh nhân
router.get(
  '/patient/:patientId',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  (req, res, next) => {
    const { error } = validateBilling.billQuery(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.getPatientBills
);

// Xác minh bảo hiểm
router.post(
  '/patient/:patientId/insurance/verify',
  requirePermission(PERMISSIONS['BILL_UPDATE']),
  (req, res, next) => {
    const { error } = validateBilling.verifyInsurance(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.verifyInsurance
);

// Gửi yêu cầu bảo hiểm
router.post(
  '/:billId/insurance-claim',
  requirePermission(PERMISSIONS['BILL_PROCESS_PAYMENTS']),
  (req, res, next) => {
    const { error } = validateBilling.insuranceClaim(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details });
    next();
  },
  billingController.submitInsuranceClaim
);

// Lấy hóa đơn chưa thanh toán
router.get(
  '/outstanding',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getOutstandingBills
);

// Lấy thống kê doanh thu
router.get(
  '/stats/revenue',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getRevenueStats
);

// Xuất hóa đơn PDF
router.get(
  '/:billId/invoice/pdf',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.generateInvoicePDF
);

// Xuất biên lai PDF
router.get(
  '/payments/:paymentId/receipt/pdf',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.generateReceiptPDF
);

module.exports = router;