const express = require("express");
const router = express.Router();

// Import all patient portal routes
const demographicsRoutes = require("./demographics.routes");
const insuranceRoutes = require("./insurance.routes");
const medicalHistoryRoutes = require("./medicalHistory.routes");
const emergencyContactRoutes = require("./emergencyContact.routes");
const visitsRoutes = require("./visits.routes");
const admissionsRoutes = require("./admissions.routes");
const communicationRoutes = require("./communication.routes");
const billingRoutes = require("./billing.routes");
const dashboardRoutes = require("./dashboard.routes");
const appointmentsRoutes = require("./appointments.routes");
const prescriptionsRoutes = require("./prescriptions.routes");
const labResultsRoutes = require("./labResults.routes");

// Mount routes
router.use("/demographics", demographicsRoutes);
router.use("/insurance", insuranceRoutes);
router.use("/medical-history", medicalHistoryRoutes);
router.use("/emergency-contacts", emergencyContactRoutes);
router.use("/visits", visitsRoutes);
router.use("/admissions", admissionsRoutes);
router.use("/communication", communicationRoutes);
router.use("/billing", billingRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/prescriptions", prescriptionsRoutes);
router.use("/lab-results", labResultsRoutes);

module.exports = router;
