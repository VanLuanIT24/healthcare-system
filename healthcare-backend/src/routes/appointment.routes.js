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

// ✅ FIX: ĐẶT CÁC SPECIFIC ROUTES TRƯỚC DYNAMIC ROUTES

// 🎯 TÌM KIẾM LỊCH HẸN NÂNG CAO - PHẢI TRƯỚC /:appointmentId
router.get(
  '/search/advanced',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.searchAppointments),
  appointmentController.searchAppointments
);

// 🎯 TÌM KIẾM HỒ SƠ THEO CHẨN ĐOÁN - PHẢI TRƯỚC /:appointmentId
router.get(
  '/search/diagnosis',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  validateQuery(medicalRecordValidation.searchByDiagnosis),
  medicalRecordController.searchMedicalRecordsByDiagnosis
);

// 🎯 THỐNG KÊ HỒ SƠ BỆNH ÁN - PHẢI TRƯỚC /:appointmentId
router.get(
  '/stats/overview',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  validateQuery(medicalRecordValidation.getStats),
  medicalRecordController.getMedicalRecordsStats
);

// 🎯 TỰ ĐỘNG GỬI NHẮC NHỞ - PHẢI TRƯỚC /:appointmentId
router.post(
  '/reminders/send-scheduled',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SYSTEM_CONFIG),
  appointmentController.sendScheduledReminders
);

// 🎯 LẤY LỊCH LÀM VIỆC - PHẢI TRƯỚC /:appointmentId
router.get(
  '/schedules/doctor/:id',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW_SCHEDULE),
  validateQuery(appointmentValidation.getDoctorSchedule),
  appointmentController.getDoctorSchedule
);

// 🎯 CẬP NHẬT LỊCH LÀM VIỆC - PHẢI TRƯỚC /:appointmentId
router.put(
  '/schedules/:id',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.updateSchedule),
  appointmentController.updateSchedule
);

// 🎯 TẠO LỊCH LÀM VIỆC - PHẢI TRƯỚC /:appointmentId
router.post(
  '/schedules',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createSchedule),
  appointmentController.createSchedule
);

// 🎯 LẤY LỊCH HẸN THEO DEPARTMENT - PHẢI TRƯỚC /:appointmentId
router.get(
  '/department/:id',
  requireRole(ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.getDoctorSchedule),
  appointmentController.getDepartmentAppointments
);

// 🎯 LẤY CÁC SLOT THỜI GIAN KHẢ DỤNG - PHẢI TRƯỚC /:appointmentId
router.get(
  '/available-slots',
  requireRole(ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.getAvailableSlots),
  appointmentController.getAvailableSlots
);

// 🎯 THỐNG KÊ LỊCH HẸN - PHẢI TRƯỚC /:appointmentId
router.get(
  '/stats',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  validateQuery(appointmentValidation.getAppointmentStats),
  appointmentController.getAppointmentStats
);

// 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN - PHẢI TRƯỚC /:appointmentId
router.get(
  '/patient/:id',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  requirePatientDataAccess('patientId'),
  validateQuery(appointmentValidation.getPatientAppointments),
  appointmentController.getPatientAppointments
);

// 🎯 LẤY LỊCH SỬ PHẪU THUẬT - PHẢI TRƯỚC /:appointmentId
router.get(
  '/patient/:id/surgical-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getSurgicalHistory
);

// 🎯 LẤY TIỀN SỬ SẢN KHOA - PHẢI TRƯỚC /:appointmentId
router.get(
  '/patient/:id/obstetric-history',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.VIEW_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  medicalRecordController.getObstetricHistory
);

// 🎯 THÊM THÔNG TIN PHẪU THUẬT - PHẢI TRƯỚC /:appointmentId
router.post(
  '/patient/:id/surgical-history',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.UPDATE_MEDICAL_RECORDS),
  requirePatientDataAccess('patientId'),
  validateBody(medicalRecordValidation.addSurgicalHistory),
  medicalRecordController.addSurgicalHistory
);

// 🎯 GHI NHẬN PHÁT HIỆN LÂM SÀNG - PHẢI TRƯỚC /:appointmentId
router.post(
  '/clinical-findings',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.CREATE_MEDICAL_RECORDS),
  validateBody(medicalRecordValidation.recordClinicalFindings),
  medicalRecordController.recordClinicalFindings
);

// 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ - PHẢI TRƯỚC /:appointmentId
router.get(
  '/doctor/:id',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateQuery(appointmentValidation.getDoctorAppointments),
  appointmentController.getDoctorAppointments
);

// TẠO LỊCH HẸN
router.post(
  '/',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createAppointment),
  appointmentController.createAppointment
);

// LẤY TẤT CẢ LỊCH HẸN
router.get(
  '/',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getAllAppointments
);

// ✅ LẤY LỊCH HẸN THEO ID (DYNAMIC ROUTE - ĐẶT CUỐI CÙNG)
router.get(
  '/:id',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointmentById
);

// 🎯 CẬP NHẬT LỊCH HẸN
router.put(
  '/:id',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.updateAppointment),
  appointmentController.updateAppointment
);

// 🎯 CHECK-IN LỊCH HẸN
router.patch(
  '/:id/check-in',
  requireRole(ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  appointmentController.checkInAppointment
);

// 🎯 HOÀN THÀNH LỊCH HẸN
router.patch(
  '/:id/complete',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.completeAppointment),
  appointmentController.completeAppointment
);

// 🎯 HỦY LỊCH HẹN
router.post(
  '/:id/cancel',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CANCEL),
  validateBody(appointmentValidation.cancelAppointment),
  appointmentController.cancelAppointment
);

// 🎯 ĐẶT LẠI LỊCH HẸN
router.post(
  '/:id/reschedule',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.rescheduleAppointment),
  appointmentController.rescheduleAppointment
);

// 🎯 GỬI THÔNG BÁO NHẮC LỊCH HẸN
router.post(
  '/:id/remind',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateBody(appointmentValidation.sendReminder),
  appointmentController.sendAppointmentReminder
);

// 🎯 THÊM ROUTE THIẾU - Today's appointments
router.get(
  '/today',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getTodayAppointments
);

// 🎯 THÊM ROUTE THIẾU - Upcoming appointments
router.get(
  '/upcoming',
  requireRole(ROLES.DOCTOR, ROLES.PATIENT, ROLES.NURSE, ROLES.RECEPTIONIST),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getUpcomingAppointments
);

module.exports = router;