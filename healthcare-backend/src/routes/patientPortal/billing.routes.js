const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { BillingController } = require("../../controllers/patientPortal");

const verifyAuth = authenticate;
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }
    req.validated = value;
    next();
  };
};

// Validation Schemas
const createBillingSchema = Joi.object({
  invoiceNumber: Joi.string().max(50).required(),
  visitId: Joi.string().optional(),
  admissionId: Joi.string().optional(),
  totalAmount: Joi.number().min(0).required(),
  insuranceCoverage: Joi.number().min(0).max(100).optional(),
  copayAmount: Joi.number().min(0).optional(),
  deductibleApplied: Joi.number().min(0).optional(),
  insuranceAmount: Joi.number().min(0).optional(),
  patientResponsibility: Joi.number().min(0).optional(),
  billDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  notes: Joi.string().max(500).optional(),
});

const updateBillingSchema = Joi.object({
  totalAmount: Joi.number().min(0).optional(),
  insuranceCoverage: Joi.number().min(0).max(100).optional(),
  copayAmount: Joi.number().min(0).optional(),
  dueDate: Joi.date().optional(),
  notes: Joi.string().max(500).optional(),
}).min(1);

const paymentMethodSchema = Joi.object({
  methodType: Joi.string()
    .valid("CreditCard", "DebitCard", "BankTransfer", "Cash")
    .required(),
  cardHolderName: Joi.string().max(100).optional(),
  cardNumber: Joi.string()
    .pattern(/^[0-9]{13,19}$/)
    .optional(),
  expiryDate: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .optional(),
  cvv: Joi.string()
    .pattern(/^[0-9]{3,4}$/)
    .optional(),
  bankAccountNumber: Joi.string().optional(),
  isDefault: Joi.boolean().default(false).optional(),
});

const processPaymentSchema = Joi.object({
  paymentMethodId: Joi.string().required(),
  paymentAmount: Joi.number().min(0).required(),
  paymentDate: Joi.date().required(),
  notes: Joi.string().max(500).optional(),
});

const refundSchema = Joi.object({
  refundAmount: Joi.number().min(0).required(),
  refundReason: Joi.string().max(500).required(),
  paymentMethodId: Joi.string().required(),
  notes: Joi.string().max(500).optional(),
});

// Routes
// GET: Lấy tất cả hóa đơn
router.get("/", verifyAuth, BillingController.getBillings);

// GET: Chi tiết hóa đơn theo ID
router.get("/:billingId", verifyAuth, BillingController.getBilling);

// GET: Hóa đơn quá hạn
router.get("/overdue", verifyAuth, BillingController.getOverdueBillings);

// POST: Tạo hóa đơn mới
router.post(
  "/",
  verifyAuth,
  validateRequest(createBillingSchema),
  BillingController.createBilling
);

// PUT: Cập nhật hóa đơn
router.put(
  "/:billingId",
  verifyAuth,
  validateRequest(updateBillingSchema),
  BillingController.updateBilling
);

// DELETE: Xóa hóa đơn
router.delete("/:billingId", verifyAuth, BillingController.deleteBilling);

// Payment Method Routes
// POST: Thêm phương thức thanh toán
router.post(
  "/payment-methods",
  verifyAuth,
  validateRequest(paymentMethodSchema),
  BillingController.addPaymentMethod
);

// POST: Xử lý thanh toán
router.post(
  "/:billingId/payment",
  verifyAuth,
  validateRequest(processPaymentSchema),
  BillingController.processPayment
);

// POST: Hoàn tiền
router.post(
  "/:billingId/refund",
  verifyAuth,
  validateRequest(refundSchema),
  BillingController.processRefund
);

// GET: Thống kê hóa đơn
router.get(
  "/statistics/billing",
  verifyAuth,
  BillingController.getBillingStats
);

// POST: Xuất hóa đơn
router.post("/:billingId/export", verifyAuth, BillingController.exportBilling);

module.exports = router;
