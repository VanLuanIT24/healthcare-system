// 🎯 API Services Index - Central Export
// Import all API services
import adminAPI from './adminAPI';
import adminExtendedAPI from './adminExtendedAPI';
import appointmentAPI from './appointmentAPI';
import authAPI from './authAPI';
import billingAPI from './billingAPI';
import clinicalAPI from './clinicalAPI';
import clinicalExtendedAPI from './clinicalExtendedAPI';
import laboratoryAPI from './laboratoryAPI';
import medicationAPI from './medicationAPI';
import patientAPI from './patientAPI';
import patientExtendedAPI from './patientExtendedAPI';
import prescriptionAPI from './prescriptionAPI';
import reportAPI from './reportAPI';
import reportExtendedAPI from './reportExtendedAPI';
import userAPI from './userAPI';

// Export all services
export {
  adminAPI,
  adminExtendedAPI,
  appointmentAPI,
  authAPI,
  billingAPI,
  clinicalAPI,
  clinicalExtendedAPI,
  laboratoryAPI,
  medicationAPI,
  patientAPI,
  patientExtendedAPI,
  prescriptionAPI,
  reportAPI,
  reportExtendedAPI,
  userAPI
};

// Export default object with all services
export default {
  admin: adminAPI,
  adminExtended: adminExtendedAPI,
  appointment: appointmentAPI,
  auth: authAPI,
  billing: billingAPI,
  clinical: clinicalAPI,
  clinicalExtended: clinicalExtendedAPI,
  laboratory: laboratoryAPI,
  medication: medicationAPI,
  patient: patientAPI,
  patientExtended: patientExtendedAPI,
  prescription: prescriptionAPI,
  report: reportAPI,
  reportExtended: reportExtendedAPI,
  user: userAPI
};
