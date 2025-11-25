const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const {
  EmergencyContactController,
} = require("../../controllers/patientPortal");

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
const createEmergencyContactSchema = Joi.object({
  name: Joi.string().max(100).required(),
  relationship: Joi.string()
    .valid("Spouse", "Parent", "Child", "Sibling", "Friend", "Other")
    .required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .required(),
  alternatePhone: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(200).optional(),
  isPrimary: Joi.boolean().default(false).optional(),
  priority: Joi.number().min(1).max(10).default(1).optional(),
  canMakeDecisions: Joi.boolean().default(false).optional(),
  notificationPreference: Joi.string()
    .valid("Call", "SMS", "Email", "All")
    .default("Call")
    .optional(),
  notes: Joi.string().max(500).optional(),
});

const updateEmergencyContactSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  relationship: Joi.string()
    .valid("Spouse", "Parent", "Child", "Sibling", "Friend", "Other")
    .optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .optional(),
  alternatePhone: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(200).optional(),
  priority: Joi.number().min(1).max(10).optional(),
  canMakeDecisions: Joi.boolean().optional(),
  notificationPreference: Joi.string()
    .valid("Call", "SMS", "Email", "All")
    .optional(),
  notes: Joi.string().max(500).optional(),
}).min(1);

// Routes
// GET: Lấy tất cả liên hệ khẩn cấp
router.get("/", verifyAuth, EmergencyContactController.getEmergencyContacts);

// GET: Lấy liên hệ khẩn cấp chính
router.get(
  "/primary",
  verifyAuth,
  EmergencyContactController.getPrimaryContact
);

// GET: Lấy chi tiết liên hệ theo ID
router.get(
  "/:contactId",
  verifyAuth,
  EmergencyContactController.getEmergencyContact
);

// GET: Lấy liên hệ theo độ ưu tiên
router.get(
  "/priority/list",
  verifyAuth,
  EmergencyContactController.getContactsByPriority
);

// POST: Thêm liên hệ khẩn cấp mới
router.post(
  "/",
  verifyAuth,
  validateRequest(createEmergencyContactSchema),
  EmergencyContactController.addEmergencyContact
);

// PUT: Cập nhật liên hệ
router.put(
  "/:contactId",
  verifyAuth,
  validateRequest(updateEmergencyContactSchema),
  EmergencyContactController.updateEmergencyContact
);

// PUT: Đặt làm liên hệ chính
router.put(
  "/:contactId/set-primary",
  verifyAuth,
  EmergencyContactController.setPrimaryContact
);

// POST: Xác thực liên hệ
router.post(
  "/:contactId/verify",
  verifyAuth,
  EmergencyContactController.verifyContact
);

// DELETE: Xóa liên hệ
router.delete(
  "/:contactId",
  verifyAuth,
  EmergencyContactController.deleteEmergencyContact
);

module.exports = router;
