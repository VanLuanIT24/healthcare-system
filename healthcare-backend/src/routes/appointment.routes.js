// src/routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/appointment.validation');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');
const { ROLES } = require('../constants/roles');

// ==================================================================
// QUẢN LÝ LỊCH HẸN - Dành cho tất cả vai trò liên quan
// ==================================================================

// Tạo lịch hẹn
router.post('/',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.createAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE),
  appointmentController.createAppointment
);

// Lấy tất cả lịch hẹn
router.get('/',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointments
);

// 🎯 SPECIFIC ROUTES MUST COME BEFORE /:id (IMPORTANT!)

// Lấy lịch hẹn hôm nay
router.get('/today',
  authMiddleware,
  validate(schemas.getTodayAppointments, 'query'),
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getTodayAppointments
);

// Lấy lịch hẹn sắp tới
router.get('/upcoming',
  authMiddleware,
  validate(schemas.getUpcomingAppointments, 'query'),
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getUpcomingAppointments
);

// Lấy slot thời gian khả dụng
router.get('/available-slots',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAvailableSlots, 'query'),
  appointmentController.getAvailableSlots
);

// Lấy thống kê lịch hẹn
router.get('/stats',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN]),
  validate(schemas.getAppointmentStats, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointmentStats
);

// Export lịch hẹn (PDF)
router.get('/export/pdf',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.exportAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.exportAppointmentsPDF
);

// Export lịch hẹn (Excel)
router.get('/export/excel',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.exportAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.exportAppointmentsExcel
);

// Lấy lịch làm việc của bác sĩ
router.get('/schedules/doctor/:doctorId',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getDoctorSchedule, 'params'),
  validate(schemas.getDoctorSchedule, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorSchedule
);

// Lấy lịch hẹn của bác sĩ
router.get('/doctor/:doctorId',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorAppointments
);

// Lấy lịch hẹn của bệnh nhân
router.get('/patient/:patientId',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getPatientAppointments, 'params'),
  validate(schemas.getAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getPatientAppointments
);

// 🎯 GENERIC ROUTES COME AFTER SPECIFIC ONES

// Lấy lịch hẹn theo ID
router.get('/:id',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointmentById
);

// Cập nhật lịch hẹn
router.put('/:id',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.updateAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.updateAppointment
);

// Hủy lịch hẹn (confirm cancel)
router.patch('/:id/cancel',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.cancelAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_CANCEL),
  appointmentController.cancelAppointment
);

// Yêu cầu hủy lịch hẹn (cho bệnh nhân)
router.post('/:id/cancel-request',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.requestCancelAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_REQUEST_CANCEL),
  appointmentController.requestCancelAppointment
);

// Duyệt yêu cầu hủy
router.patch('/:id/cancel-request/approve',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.CLINICAL_ADMIN, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.approveCancelRequest, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_APPROVE_CANCEL),
  appointmentController.approveCancelRequest
);

// Đặt lại lịch hẹn
router.patch('/:id/reschedule',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.rescheduleAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.rescheduleAppointment
);

// Check-in lịch hẹn
router.patch('/:id/check-in',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.checkInAppointment
);

// Hoàn thành lịch hẹn
router.patch('/:id/complete',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.completeAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.completeAppointment
);

// Đánh dấu no-show
router.patch('/:id/no-show',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  validate(schemas.noShowAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.noShowAppointment
);





// Tạo lịch làm việc bác sĩ
router.post('/schedules',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.createDoctorSchedule, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE),
  appointmentController.createDoctorSchedule
);

// Cập nhật lịch làm việc bác sĩ
router.put('/schedules/:scheduleId',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.updateDoctorSchedule, 'params'),
  validate(schemas.updateDoctorSchedule, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.updateDoctorSchedule
);

// Xóa lịch làm việc bác sĩ
router.delete('/schedules/:scheduleId',
  authMiddleware,
  roleMiddleware([ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.deleteDoctorSchedule, 'params'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_DELETE),
  appointmentController.deleteDoctorSchedule
);

// Gửi nhắc nhở cho một lịch hẹn
router.post('/:id/reminder',
  authMiddleware,
  roleMiddleware([ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.sendReminder
);

// Gửi nhắc nhở hàng loạt
router.post('/reminders/bulk',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE),
  appointmentController.sendBulkReminders
);

// Lấy access logs của lịch hẹn
router.get('/:id/access-logs',
  authMiddleware,
  roleMiddleware([ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN]),
  validate(schemas.getAppointmentById, 'params'),
  auditLog(AUDIT_ACTIONS.SYSTEM_VIEW_AUDIT_LOG),
  appointmentController.getAppointmentAccessLogs
);

module.exports = router;