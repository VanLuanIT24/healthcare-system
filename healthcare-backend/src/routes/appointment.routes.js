const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const appointmentValidation = require('../validations/appointment.validation');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const { 
  requireRole, 
  requirePermission, 
  requirePatientDataAccess,
  requireModuleAccess 
} = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');
const { authenticate } = require('../middlewares/auth.middleware');

// 🚨 THÊM IMPORT NÀY - FIX LỖI
const medicalRecordController = require('../controllers/medicalRecord.controller');
const medicalRecordValidation = require('../validations/medicalRecord.validation');

/**
 * APPOINTMENT ROUTES
 * Quản lý tất cả endpoints liên quan đến lịch hẹn
 */

// APPLY AUTH MIDDLEWARE CHO TẤT CẢ ROUTES
router.use(authenticate);

// TẠO LỊCH HẸN
router.post(
  '/',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createAppointment),
  appointmentController.createAppointment
);

// LẤY LỊCH HẸN CỦA BỆNH NHÂN
router.get(
  '/patient/:patientId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  requirePatientDataAccess('patientId'),
  validateQuery(appointmentValidation.getPatientAppointments),
  appointmentController.getPatientAppointments
);

// LẤY LỊCH HẸN CỦA BÁC SĨ
router.get(
  '/doctor/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.getDoctorAppointments),
  appointmentController.getDoctorAppointments
);

// LẤY THÔNG TIN LỊCH HẸN CHI TIẾT
router.get(
  '/:appointmentId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointment
);

// 🎯 CẬP NHẬT LỊCH HẸN
router.put(
  '/:appointmentId',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.updateAppointment),
  appointmentController.updateAppointment
);

// 🎯 HỦY LỊCH HẸN
router.post(
  '/:appointmentId/cancel',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CANCEL),
  validateBody(appointmentValidation.cancelAppointment),
  appointmentController.cancelAppointment
);

// 🎯 TẠO LỊCH LÀM VIỆC
router.post(
  '/schedules',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createSchedule),
  appointmentController.createSchedule
);

// 🎯 LẤY LỊCH LÀM VIỆC
router.get(
  '/schedules/doctor/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW_SCHEDULE),
  validateQuery(appointmentValidation.getDoctorSchedule),
  appointmentController.getDoctorSchedule
);

// 🎯 ĐẶT LẠI LỊCH HẸN
router.post(
  '/:appointmentId/reschedule',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.rescheduleAppointment),
  appointmentController.rescheduleAppointment
);

// 🎯 TÌM KIẾM LỊCH HẸN NÂNG CAO
router.get(
  '/search/advanced',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.searchAppointments),
  appointmentController.searchAppointments
);

// 🎯 LẤY LỊCH HẸN THEO DEPARTMENT
router.get(
  '/department/:departmentId',
  requireRole(ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.getDoctorSchedule),
  appointmentController.getDepartmentAppointments
);

// 🎯 CẬP NHẬT LỊCH LÀM VIỆC
router.put(
  '/schedules/:scheduleId',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.updateSchedule),
  appointmentController.updateSchedule
);

// 🎯 GỬI THÔNG BÁO NHẮC LỊCH HẸN
router.post(
  '/:appointmentId/remind',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.sendReminder),
  appointmentController.sendAppointmentReminder
);

// 🎯 TỰ ĐỘNG GỬI NHẮC NHỞ (ADMIN ONLY)
router.post(
  '/reminders/send-scheduled',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SYSTEM_CONFIG),
  appointmentController.sendScheduledReminders
);

// 🎯 LẤY LỊCH SỬ PHẪU THUẬT - ĐÃ SỬA LỖI
router.get(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getSurgicalHistory  // ✅ ĐÃ ĐƯỢC IMPORT
);

// 🎯 LẤY TIỀN SỬ SẢN KHOA - ĐÃ SỬA LỖI
router.get(
  '/patient/:patientId/obstetric-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getObstetricHistory  // ✅ ĐÃ ĐƯỢC IMPORT
);

// 🎯 THÊM THÔNG TIN PHẪU THUẬT - ĐÃ SỬA LỖI
router.post(
  '/patient/:patientId/surgical-history',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  validateBody(medicalRecordValidation.addSurgicalHistory),  // ✅ ĐÃ ĐƯỢC IMPORT
  medicalRecordController.addSurgicalHistory  // ✅ ĐÃ ĐƯỢC IMPORT
);

// 🎯 GHI NHẬN PHÁT HIỆN LÂM SÀNG - ĐÃ SỬA LỖI
router.post(
  '/clinical-findings',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.CREATE_MEDICAL_RECORDS),
  validateBody(medicalRecordValidation.recordClinicalFindings),  // ✅ ĐÃ ĐƯỢC IMPORT
  medicalRecordController.recordClinicalFindings  // ✅ ĐÃ ĐƯỢC IMPORT
);

// 🎯 TÌM KIẾM HỒ SƠ THEO CHẨN ĐOÁN - ĐÃ SỬA LỖI
router.get(
  '/search/diagnosis',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  validateQuery(medicalRecordValidation.searchByDiagnosis),  // ✅ ĐÃ ĐƯỢC IMPORT
  medicalRecordController.searchMedicalRecordsByDiagnosis  // ✅ ĐÃ ĐƯỢC IMPORT
);

// 🎯 THỐNG KÊ HỒ SƠ BỆNH ÁN - ĐÃ SỬA LỖI
router.get(
  '/stats/overview',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  validateQuery(medicalRecordValidation.getStats),  // ✅ ĐÃ ĐƯỢC IMPORT
  medicalRecordController.getMedicalRecordsStats  // ✅ ĐÃ ĐƯỢC IMPORT
);

module.exports = router;