const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { AppointmentsController } = require("../../controllers/patientPortal");

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
const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  appointmentType: Joi.string()
    .valid("Consultation", "Follow-up", "Routine")
    .required(),
  preferredDate: Joi.date().required(),
  preferredTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).optional(),
  notes: Joi.string().max(500).optional(),
});

const rescheduleSchema = Joi.object({
  newDate: Joi.date().required(),
  newTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  reason: Joi.string().max(500).optional(),
});

// Routes
// GET: Lấy tất cả cuộc hẹn
router.get("/", verifyAuth, AppointmentsController.getMyAppointments);

// GET: Cuộc hẹn sắp tới
router.get(
  "/upcoming",
  verifyAuth,
  AppointmentsController.getUpcomingAppointments
);

// GET: Cuộc hẹn trong quá khứ
router.get("/past", verifyAuth, AppointmentsController.getPastAppointments);

// GET: Chi tiết cuộc hẹn theo ID
router.get(
  "/:appointmentId",
  verifyAuth,
  AppointmentsController.getAppointmentDetail
);

// POST: Đặt cuộc hẹn mới
router.post(
  "/",
  verifyAuth,
  validateRequest(bookAppointmentSchema),
  AppointmentsController.bookAppointment
);

// PUT: Lên lịch lại cuộc hẹn
router.put(
  "/:appointmentId/reschedule",
  verifyAuth,
  validateRequest(rescheduleSchema),
  AppointmentsController.rescheduleAppointment
);

// POST: Hủy cuộc hẹn
router.post(
  "/:appointmentId/cancel",
  verifyAuth,
  AppointmentsController.cancelAppointment
);

// POST: Xác nhận tham dự
router.post(
  "/:appointmentId/confirm",
  verifyAuth,
  AppointmentsController.confirmAttendance
);

// GET: Các khe khả dụng
router.get(
  "/available-slots/:doctorId",
  verifyAuth,
  AppointmentsController.getAvailableSlots
);

// GET: Thống kê cuộc hẹn
router.get(
  "/statistics",
  verifyAuth,
  AppointmentsController.getAppointmentStats
);

module.exports = router;
