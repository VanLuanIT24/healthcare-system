/**
 * Patient Portal Models Index
 * Export tất cả models liên quan đến Patient Portal
 */

const Demographics = require("./demographics.model");
const Insurance = require("./insurance.model");
const MedicalHistory = require("./medicalHistory.model");
const EmergencyContact = require("./emergencyContact.model");
const Visit = require("./visit.model");
const Admission = require("./admission.model");
const Communication = require("./communication.model");
const CommunicationThread = require("./communicationThread.model");
const Vaccination = require("./vaccination.model");
const Allergy = require("./allergy.model");
const Billing = require("./billing.model");

// Existing models
const Appointment = require("./appointment.model");
const Prescription = require("./prescription.model");
const MedicalRecord = require("./medicalRecord.model");
const LabOrder = require("./labOrder.model");
const Patient = require("./patient.model");
const User = require("./user.model");

module.exports = {
  // New Patient Portal Models
  Demographics,
  Insurance,
  MedicalHistory,
  EmergencyContact,
  Visit,
  Admission,
  Communication,
  CommunicationThread,
  Vaccination,
  Allergy,
  Billing,

  // Existing Models
  Appointment,
  Prescription,
  MedicalRecord,
  LabOrder,
  Patient,
  User,
};
