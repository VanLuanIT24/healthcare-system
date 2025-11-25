/**
 * Patient Portal Services Index
 * Central export file for all patient portal services
 */

const DemographicsService = require("./demographics.service");
const InsuranceService = require("./insurance.service");
const MedicalHistoryService = require("./medicalHistory.service");
const EmergencyContactService = require("./emergencyContact.service");
const VisitService = require("./visits.service");
const AdmissionService = require("./admissions.service");
const CommunicationService = require("./communication.service");
const BillingService = require("./billing.service");
const AppointmentsService = require("./appointments.service");
const PrescriptionsService = require("./prescriptions.service");
const LabResultsService = require("./labResults.service");
const DashboardService = require("./dashboard.service");

module.exports = {
  DemographicsService,
  InsuranceService,
  MedicalHistoryService,
  EmergencyContactService,
  VisitService,
  AdmissionService,
  CommunicationService,
  BillingService,
  AppointmentsService,
  PrescriptionsService,
  LabResultsService,
  DashboardService,
};
