/**
 * Patient Portal Controllers Index
 * Central export file for all patient portal controllers
 */

const DemographicsController = require("./demographics.controller");
const InsuranceController = require("./insurance.controller");
const MedicalHistoryController = require("./medicalHistory.controller");
const EmergencyContactController = require("./emergencyContact.controller");
const VisitController = require("./visits.controller");
const AdmissionController = require("./admissions.controller");
const CommunicationController = require("./communication.controller");
const BillingController = require("./billing.controller");
const PatientDashboardController = require("./dashboard.controller");
const AppointmentsController = require("./appointments.controller");
const PrescriptionsController = require("./prescriptions.controller");
const LabResultsController = require("./labResults.controller");

module.exports = {
  DemographicsController,
  InsuranceController,
  MedicalHistoryController,
  EmergencyContactController,
  VisitController,
  AdmissionController,
  CommunicationController,
  BillingController,
  PatientDashboardController,
  AppointmentsController,
  PrescriptionsController,
  LabResultsController,
};
