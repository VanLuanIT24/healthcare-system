// src/api/index.js - Phiên bản cuối cùng (sau khi gộp)
import adminAPI from './admin/adminAPI';
import appointmentAPI from './appointmentAPI';
import authAPI from './authAPI';
import bedManagementAPI from './bedManagementAPI';
import billingAPI from './billingAPI';
import clinicalAPI from './clinicalAPI';
import inventoryAPI from './inventoryAPI';
import laboratoryAPI from './laboratoryAPI';
import medicalRecordAPI from './medicalRecordAPI';
import * as medicationAPI from './medicationAPI';
import notificationAPI from './notificationAPI';
import patientAPI from './patientAPI';
import prescriptionAPI from './prescriptionAPI';
import publicAPI from './publicAPI';
import queueAPI from './queueAPI';
import userAPI from './userAPI';
import messageAPI from './messageAPI';

// Export riêng lẻ
export {
  adminAPI,
  appointmentAPI,
  authAPI,
  bedManagementAPI,
  billingAPI,
  clinicalAPI,
  inventoryAPI,
  laboratoryAPI, medicalRecordAPI, medicationAPI, notificationAPI,
  patientAPI,
  prescriptionAPI,
  publicAPI,
  queueAPI,
  userAPI,
  messageAPI
};

// Export default
export default {
  admin: adminAPI,
  auth: authAPI,
  user: userAPI,
  patient: patientAPI,
  appointment: appointmentAPI,
  queue: queueAPI,
  clinical: clinicalAPI,
  prescription: prescriptionAPI,
  laboratory: laboratoryAPI,
  medication: medicationAPI,
  medicalRecord: medicalRecordAPI,
  inventory: inventoryAPI,
  billing: billingAPI,
  bedManagement: bedManagementAPI,
  notification: notificationAPI,
  message: messageAPI,
};