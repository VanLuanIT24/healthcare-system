const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares");
const {
  PatientDashboardController,
} = require("../../controllers/patientPortal");

const verifyAuth = authenticate;

// Routes
// GET: Tổng quan bảng điều khiển
router.get("/", verifyAuth, PatientDashboardController.getDashboardOverview);

// GET: Thống kê sức khỏe
router.get(
  "/health-stats",
  verifyAuth,
  PatientDashboardController.getHealthStats
);

// GET: Cuộc hẹn sắp tới
router.get(
  "/upcoming-appointments",
  verifyAuth,
  PatientDashboardController.getUpcomingAppointments
);

// GET: Hồ sơ y tế gần đây
router.get(
  "/recent-records",
  verifyAuth,
  PatientDashboardController.getRecentMedicalRecords
);

// GET: Cảnh báo sức khỏe
router.get(
  "/health-alerts",
  verifyAuth,
  PatientDashboardController.getHealthAlerts
);

// GET: Nhắc nhở thuốc
router.get(
  "/medication-reminders",
  verifyAuth,
  PatientDashboardController.getMedicationReminders
);

// GET: Lịch sử hoạt động
router.get(
  "/activity-history",
  verifyAuth,
  PatientDashboardController.getActivityHistory
);

// GET: Hành động nhanh
router.get(
  "/quick-actions",
  verifyAuth,
  PatientDashboardController.getQuickActions
);

module.exports = router;
