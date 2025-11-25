const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { DemographicsController } = require("../../controllers/patientPortal");

// Middleware
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
const createDemographicsSchema = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  middleName: Joi.string().max(50).optional(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid("M", "F", "Other").required(),
  bloodType: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .required(),
  maritalStatus: Joi.string()
    .valid("Single", "Married", "Divorced", "Widowed")
    .optional(),
  occupation: Joi.string().max(100).optional(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .required(),
  email: Joi.string().email().required(),
  emergencyPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .required(),
  identityNumber: Joi.string().max(50).required(),
  identityType: Joi.string()
    .valid("NationalID", "Passport", "DriverLicense")
    .required(),
  preferredLanguage: Joi.string().default("en").optional(),
  communicationPreference: Joi.string()
    .valid("Email", "SMS", "Phone", "Portal")
    .default("Portal")
    .optional(),
});

const updateDemographicsSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  middleName: Joi.string().max(50).optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid("M", "F", "Other").optional(),
  bloodType: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .optional(),
  maritalStatus: Joi.string()
    .valid("Single", "Married", "Divorced", "Widowed")
    .optional(),
  occupation: Joi.string().max(100).optional(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .optional(),
  email: Joi.string().email().optional(),
  emergencyPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10,}$/)
    .optional(),
  preferredLanguage: Joi.string().optional(),
  communicationPreference: Joi.string()
    .valid("Email", "SMS", "Phone", "Portal")
    .optional(),
}).min(1);

const addressSchema = Joi.object({
  addressType: Joi.string().valid("Home", "Work", "Other").required(),
  street: Joi.string().max(100).required(),
  city: Joi.string().max(50).required(),
  state: Joi.string().max(50).required(),
  postalCode: Joi.string().max(20).required(),
  country: Joi.string().max(50).required(),
  isPrimary: Joi.boolean().default(false).optional(),
});

const updateAddressSchema = Joi.object({
  addressType: Joi.string().valid("Home", "Work", "Other").optional(),
  street: Joi.string().max(100).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  postalCode: Joi.string().max(20).optional(),
  country: Joi.string().max(50).optional(),
  isPrimary: Joi.boolean().optional(),
}).min(1);

// Routes
// GET: Lấy thông tin nhân khẩu hiện tại
router.get("/", verifyAuth, DemographicsController.getDemographics);

// POST: Tạo hoặc cập nhật thông tin nhân khẩu
router.post(
  "/",
  verifyAuth,
  validateRequest(createDemographicsSchema),
  DemographicsController.createOrUpdateDemographics
);

// PUT: Cập nhật thông tin nhân khẩu
router.put(
  "/",
  verifyAuth,
  validateRequest(updateDemographicsSchema),
  DemographicsController.createOrUpdateDemographics
);

// DELETE: Xóa thông tin nhân khẩu
router.delete("/", verifyAuth, DemographicsController.deleteDemographics);

// Address Management Routes
// GET: Lấy tất cả địa chỉ
router.get("/addresses/all", verifyAuth, DemographicsController.getAddresses);

// POST: Thêm địa chỉ mới
router.post(
  "/addresses/add",
  verifyAuth,
  validateRequest(addressSchema),
  DemographicsController.addAddress
);

// PUT: Cập nhật địa chỉ
router.put(
  "/addresses/:addressId",
  verifyAuth,
  validateRequest(updateAddressSchema),
  DemographicsController.updateAddress
);

// DELETE: Xóa địa chỉ
router.delete(
  "/addresses/:addressId",
  verifyAuth,
  DemographicsController.deleteAddress
);

module.exports = router;
