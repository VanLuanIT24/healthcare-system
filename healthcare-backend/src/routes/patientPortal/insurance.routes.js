const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { InsuranceController } = require("../../controllers/patientPortal");

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
const createInsuranceSchema = Joi.object({
  provider: Joi.string().max(100).required(),
  policyNumber: Joi.string().max(50).required(),
  groupNumber: Joi.string().max(50).optional(),
  planName: Joi.string().max(100).required(),
  planType: Joi.string().valid("HMO", "PPO", "HDHP", "POS").required(),
  effectiveDate: Joi.date().required(),
  expiryDate: Joi.date().required(),
  memberId: Joi.string().max(50).optional(),
  relationshipToHolder: Joi.string()
    .valid("Self", "Spouse", "Child", "Parent", "Other")
    .required(),
  holderName: Joi.string().max(100).required(),
  holderDOB: Joi.date().optional(),
  copay: Joi.number().min(0).optional(),
  deductible: Joi.number().min(0).optional(),
  outOfPocketMax: Joi.number().min(0).optional(),
  coinsurance: Joi.number().min(0).max(100).optional(),
  isPrimary: Joi.boolean().default(false).optional(),
});

const updateInsuranceSchema = Joi.object({
  provider: Joi.string().max(100).optional(),
  policyNumber: Joi.string().max(50).optional(),
  groupNumber: Joi.string().max(50).optional(),
  planName: Joi.string().max(100).optional(),
  planType: Joi.string().valid("HMO", "PPO", "HDHP", "POS").optional(),
  effectiveDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  memberId: Joi.string().max(50).optional(),
  relationshipToHolder: Joi.string()
    .valid("Self", "Spouse", "Child", "Parent", "Other")
    .optional(),
  holderName: Joi.string().max(100).optional(),
  holderDOB: Joi.date().optional(),
  copay: Joi.number().min(0).optional(),
  deductible: Joi.number().min(0).optional(),
  outOfPocketMax: Joi.number().min(0).optional(),
  coinsurance: Joi.number().min(0).max(100).optional(),
}).min(1);

// Routes
// GET: Lấy tất cả bảo hiểm
router.get("/", verifyAuth, InsuranceController.getInsurances);

// GET: Lấy bảo hiểm chính
router.get("/primary", verifyAuth, InsuranceController.getPrimaryInsurance);

// GET: Lấy chi tiết bảo hiểm theo ID
router.get("/:insuranceId", verifyAuth, InsuranceController.getInsurance);

// POST: Thêm bảo hiểm mới
router.post(
  "/",
  verifyAuth,
  validateRequest(createInsuranceSchema),
  InsuranceController.addInsurance
);

// PUT: Cập nhật bảo hiểm
router.put(
  "/:insuranceId",
  verifyAuth,
  validateRequest(updateInsuranceSchema),
  InsuranceController.updateInsurance
);

// PUT: Đặt bảo hiểm làm chính
router.put(
  "/:insuranceId/set-primary",
  verifyAuth,
  InsuranceController.setPrimaryInsurance
);

// POST: Xác thực bảo hiểm
router.post(
  "/:insuranceId/verify",
  verifyAuth,
  InsuranceController.verifyInsurance
);

// DELETE: Xóa bảo hiểm
router.delete("/:insuranceId", verifyAuth, InsuranceController.deleteInsurance);

module.exports = router;
