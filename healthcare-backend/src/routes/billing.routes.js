// routes/billing.routes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { validateBilling } = require('../validations/billing.validation');
const { PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

/**
 * @swagger
 * /api/billing:
 *   post:
 *     summary: Tạo hóa đơn mới
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - items
 *             properties:
 *               patientId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               discount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo hóa đơn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/billing/{billId}:
 *   get:
 *     summary: Lấy thông tin hóa đơn theo ID
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin hóa đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:billId',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getBill
);

/**
 * @swagger
 * /api/billing:
 *   get:
 *     summary: Lấy danh sách hóa đơn
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, partial, cancelled, refunded]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/billing/{billId}:
 *   put:
 *     summary: Cập nhật hóa đơn
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *               discount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /api/billing/{billId}/void:
 *   patch:
 *     summary: Hủy hóa đơn
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hủy hóa đơn thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /api/billing/{billId}/payment:
 *   post:
 *     summary: Xử lý thanh toán
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer, insurance]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
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

/**
 * @swagger
 * /api/billing/{billId}/payment-history:
 *   get:
 *     summary: Lấy lịch sử thanh toán
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lịch sử thanh toán
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:billId/payment-history',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getPaymentHistory
);

/**
 * @swagger
 * /api/billing/payments/{paymentId}/refund:
 *   post:
 *     summary: Hoàn tiền
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hoàn tiền thành công
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
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

/**
 * @swagger
 * /api/billing/patient/{patientId}:
 *   get:
 *     summary: Lấy hóa đơn của bệnh nhân
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn của bệnh nhân
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /api/billing/patient/{patientId}/insurance/verify:
 *   post:
 *     summary: Xác minh bảo hiểm
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - insuranceProvider
 *               - policyNumber
 *             properties:
 *               insuranceProvider:
 *                 type: string
 *               policyNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kết quả xác minh bảo hiểm
 */
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

/**
 * @swagger
 * /api/billing/{billId}/insurance-claim:
 *   post:
 *     summary: Gửi yêu cầu bảo hiểm
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gửi yêu cầu thành công
 */
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

/**
 * @swagger
 * /api/billing/outstanding:
 *   get:
 *     summary: Lấy hóa đơn chưa thanh toán
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn chưa thanh toán
 */
router.get(
  '/outstanding',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getOutstandingBills
);

/**
 * @swagger
 * /api/billing/stats/revenue:
 *   get:
 *     summary: Lấy thống kê doanh thu
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *     responses:
 *       200:
 *         description: Thống kê doanh thu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     paidAmount:
 *                       type: number
 *                     pendingAmount:
 *                       type: number
 *                     refundedAmount:
 *                       type: number
 */
router.get(
  '/stats/revenue',
  requirePermission(PERMISSIONS['BILL_VIEW']),
  billingController.getRevenueStats
);

/**
 * @swagger
 * /api/billing/{billId}/invoice/pdf:
 *   get:
 *     summary: Xuất hóa đơn PDF
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File PDF hóa đơn
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
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