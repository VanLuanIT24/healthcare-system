const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { VisitController } = require("../../controllers/patientPortal");

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
const createVisitSchema = Joi.object({
  visitType: Joi.string()
    .valid("Consultation", "Follow-up", "Routine", "Emergency")
    .required(),
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  scheduledDate: Joi.date().required(),
  scheduledTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).optional(),
  notes: Joi.string().max(500).optional(),
});

const updateVisitSchema = Joi.object({
  visitType: Joi.string()
    .valid("Consultation", "Follow-up", "Routine", "Emergency")
    .optional(),
  doctorId: Joi.string().optional(),
  departmentId: Joi.string().optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  reason: Joi.string().max(500).optional(),
  notes: Joi.string().max(500).optional(),
}).min(1);

const completeVisitSchema = Joi.object({
  diagnosis: Joi.string().max(500).optional(),
  findings: Joi.string().max(1000).optional(),
  recommendations: Joi.array().items(Joi.string()).optional(),
  prescriptions: Joi.array().items(Joi.string()).optional(),
  followUpDate: Joi.date().optional(),
  status: Joi.string().valid("Completed", "Cancelled").required(),
});

// Routes
// GET: Lấy tất cả lần khám
router.get("/", verifyAuth, VisitController.getVisits);

// GET: Lấy lần khám sắp tới
router.get("/upcoming", verifyAuth, VisitController.getUpcomingVisits);

// GET: Lấy lần khám gần đây
router.get("/recent", verifyAuth, VisitController.getRecentVisits);

// GET: Chi tiết lần khám theo ID
router.get("/:visitId", verifyAuth, VisitController.getVisit);

// GET: Lần khám theo bác sĩ
router.get("/doctor/:doctorId", verifyAuth, VisitController.getVisitsByDoctor);

// GET: Lần khám theo phòng ban
router.get(
  "/department/:departmentId",
  verifyAuth,
  VisitController.getVisitsByDepartment
);

// POST: Tạo lần khám mới
router.post(
  "/",
  verifyAuth,
  validateRequest(createVisitSchema),
  VisitController.createVisit
);

// PUT: Cập nhật lần khám
router.put(
  "/:visitId",
  verifyAuth,
  validateRequest(updateVisitSchema),
  VisitController.updateVisit
);

// PUT: Hoàn thành/Hủy lần khám
router.put(
  "/:visitId/complete",
  verifyAuth,
  validateRequest(completeVisitSchema),
  VisitController.completeVisit
);

// POST: Hủy lần khám
router.post("/:visitId/cancel", verifyAuth, VisitController.cancelVisit);

// GET: Lấy khuyến cáo
router.get(
  "/:visitId/recommendations",
  verifyAuth,
  VisitController.getRecommendations
);

module.exports = router;
