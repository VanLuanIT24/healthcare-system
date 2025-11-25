const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { PrescriptionsController } = require("../../controllers/patientPortal");

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
const refillRequestSchema = Joi.object({
  numberOfRefills: Joi.number().min(1).max(12).required(),
  reason: Joi.string().max(500).optional(),
});

// Routes
// GET: Lấy tất cả đơn thuốc
router.get("/", verifyAuth, PrescriptionsController.getMyPrescriptions);

// GET: Đơn thuốc đang hoạt động
router.get(
  "/active",
  verifyAuth,
  PrescriptionsController.getActivePrescriptions
);

// GET: Đơn thuốc sắp hết hạn
router.get(
  "/expiring",
  verifyAuth,
  PrescriptionsController.getExpiringPrescriptions
);

// GET: Chi tiết đơn thuốc theo ID
router.get(
  "/:prescriptionId",
  verifyAuth,
  PrescriptionsController.getPrescriptionDetail
);

// POST: Yêu cầu gia hạn đơn thuốc
router.post(
  "/:prescriptionId/refill",
  verifyAuth,
  validateRequest(refillRequestSchema),
  PrescriptionsController.requestRefill
);

// GET: Lịch sử gia hạn
router.get(
  "/:prescriptionId/refill-history",
  verifyAuth,
  PrescriptionsController.getRefillHistory
);

// GET: Tải xuống đơn thuốc
router.get(
  "/:prescriptionId/download",
  verifyAuth,
  PrescriptionsController.downloadPrescription
);

// GET: Hướng dẫn sử dụng thuốc
router.get(
  "/:prescriptionId/instructions",
  verifyAuth,
  PrescriptionsController.getMedicationInstructions
);

// GET: Tác dụng phụ của thuốc
router.get(
  "/:prescriptionId/side-effects",
  verifyAuth,
  PrescriptionsController.getMedicationSideEffects
);

// GET: Nhắc nhở thuốc
router.get(
  "/reminders",
  verifyAuth,
  PrescriptionsController.getMedicationReminders
);

// GET: Thống kê đơn thuốc
router.get(
  "/statistics",
  verifyAuth,
  PrescriptionsController.getPrescriptionStats
);

module.exports = router;
