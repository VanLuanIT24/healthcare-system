const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { LabResultsController } = require("../../controllers/patientPortal");

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
const noteSchema = Joi.object({
  note: Joi.string().max(500).required(),
});

// Routes
// GET: Lấy tất cả lệnh xét nghiệm
router.get("/", verifyAuth, LabResultsController.getMyLabOrders);

// GET: Kết quả xét nghiệm đã hoàn thành
router.get(
  "/completed",
  verifyAuth,
  LabResultsController.getCompletedLabResults
);

// GET: Kết quả xét nghiệm đang chờ
router.get("/pending", verifyAuth, LabResultsController.getPendingLabResults);

// GET: Chi tiết kết quả xét nghiệm theo ID
router.get(
  "/:labResultId",
  verifyAuth,
  LabResultsController.getLabResultDetail
);

// PUT: Đánh dấu đã xem xét
router.put(
  "/:labResultId/reviewed",
  verifyAuth,
  LabResultsController.markAsReviewed
);

// GET: Kết quả xét nghiệm theo loại
router.get(
  "/type/:testType",
  verifyAuth,
  LabResultsController.getLabResultsByType
);

// GET: Tải xuống báo cáo xét nghiệm
router.get(
  "/:labResultId/download",
  verifyAuth,
  LabResultsController.downloadLabReport
);

// GET: Tham chiếu phạm vi bình thường
router.get(
  "/:labResultId/normal-range",
  verifyAuth,
  LabResultsController.getNormalRangeReference
);

// GET: Giải thích kết quả xét nghiệm
router.get(
  "/:labResultId/interpretation",
  verifyAuth,
  LabResultsController.getLabResultInterpretation
);

// GET: Thống kê xét nghiệm
router.get("/statistics", verifyAuth, LabResultsController.getLabStatistics);

// POST: Thêm ghi chú cho kết quả xét nghiệm
router.post(
  "/:labResultId/notes",
  verifyAuth,
  validateRequest(noteSchema),
  LabResultsController.addLabResultNote
);

module.exports = router;
