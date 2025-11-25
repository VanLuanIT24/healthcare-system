const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { AdmissionController } = require("../../controllers/patientPortal");

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
const createAdmissionSchema = Joi.object({
  admissionType: Joi.string()
    .valid("Emergency", "Planned", "Transfer")
    .required(),
  departmentId: Joi.string().required(),
  doctorId: Joi.string().required(),
  admissionDate: Joi.date().required(),
  reasonForAdmission: Joi.string().max(500).required(),
  estimatedDuration: Joi.number().min(1).optional(),
  insuranceVerified: Joi.boolean().default(false).optional(),
  notes: Joi.string().max(500).optional(),
});

const updateAdmissionSchema = Joi.object({
  admissionType: Joi.string()
    .valid("Emergency", "Planned", "Transfer")
    .optional(),
  departmentId: Joi.string().optional(),
  doctorId: Joi.string().optional(),
  reasonForAdmission: Joi.string().max(500).optional(),
  estimatedDuration: Joi.number().min(1).optional(),
  insuranceVerified: Joi.boolean().optional(),
  notes: Joi.string().max(500).optional(),
}).min(1);

const dischargeSchema = Joi.object({
  dischargeDate: Joi.date().required(),
  dischargeSummary: Joi.string().max(1000).optional(),
  medications: Joi.array().items(Joi.string()).optional(),
  followUpScheduled: Joi.boolean().optional(),
  followUpDate: Joi.date().optional(),
  restrictions: Joi.string().max(500).optional(),
  specialInstructions: Joi.string().max(500).optional(),
  status: Joi.string().valid("Discharged", "Transferred").required(),
});

const procedureSchema = Joi.object({
  procedureName: Joi.string().max(200).required(),
  procedureDate: Joi.date().required(),
  surgeon: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid("Scheduled", "Completed", "Cancelled").required(),
});

const investigationSchema = Joi.object({
  investigationType: Joi.string().max(100).required(),
  investigationDate: Joi.date().required(),
  findings: Joi.string().max(500).optional(),
  status: Joi.string().valid("Pending", "Completed", "Reviewed").required(),
});

// Routes
// GET: Lấy tất cả lần nhập viện
router.get("/", verifyAuth, AdmissionController.getAdmissions);

// GET: Lấy lần nhập viện hiện tại
router.get("/current", verifyAuth, AdmissionController.getCurrentAdmission);

// GET: Lấy lần nhập viện đang hoạt động
router.get("/active", verifyAuth, AdmissionController.getActiveAdmissions);

// GET: Lấy lần nhập viện đã xuất viện
router.get(
  "/discharged",
  verifyAuth,
  AdmissionController.getDischargedAdmissions
);

// GET: Chi tiết lần nhập viện theo ID
router.get("/:admissionId", verifyAuth, AdmissionController.getAdmission);

// POST: Tạo lần nhập viện mới
router.post(
  "/",
  verifyAuth,
  validateRequest(createAdmissionSchema),
  AdmissionController.createAdmission
);

// PUT: Cập nhật lần nhập viện
router.put(
  "/:admissionId",
  verifyAuth,
  validateRequest(updateAdmissionSchema),
  AdmissionController.updateAdmission
);

// PUT: Xuất viện
router.put(
  "/:admissionId/discharge",
  verifyAuth,
  validateRequest(dischargeSchema),
  AdmissionController.dischargeAdmission
);

// GET: Lấy bản tóm tắt xuất viện
router.get(
  "/:admissionId/discharge-summary",
  verifyAuth,
  AdmissionController.getDischargeSummary
);

// Procedure Routes
router.get(
  "/:admissionId/procedures",
  verifyAuth,
  AdmissionController.getProcedures
);
router.post(
  "/:admissionId/procedures",
  verifyAuth,
  validateRequest(procedureSchema),
  AdmissionController.addProcedure
);

// Investigation Routes
router.get(
  "/:admissionId/investigations",
  verifyAuth,
  AdmissionController.getInvestigations
);
router.post(
  "/:admissionId/investigations",
  verifyAuth,
  validateRequest(investigationSchema),
  AdmissionController.addInvestigation
);

// GET: Thống kê thời gian nằm viện
router.get(
  "/:admissionId/los-stats",
  verifyAuth,
  AdmissionController.getLengthOfStayStats
);

module.exports = router;
