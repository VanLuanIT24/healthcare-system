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

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Tạo lịch hẹn mới
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       201:
 *         description: Tạo lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.createAppointment, 'body'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE),
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Lấy danh sách lịch hẹn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, no-show]
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/',
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointments
);

// 🎯 SPECIFIC ROUTES MUST COME BEFORE /:id (IMPORTANT!)

/**
 * @swagger
 * /api/appointments/today:
 *   get:
 *     summary: Lấy lịch hẹn hôm nay
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn hôm nay
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/today',
  authMiddleware,
  validate(schemas.getTodayAppointments, 'query'),
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getTodayAppointments
);

/**
 * @swagger
 * /api/appointments/upcoming:
 *   get:
 *     summary: Lấy lịch hẹn sắp tới
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn sắp tới
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/upcoming',
  authMiddleware,
  validate(schemas.getUpcomingAppointments, 'query'),
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT]),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getUpcomingAppointments
);

/**
 * @swagger
 * /api/appointments/available-slots:
 *   get:
 *     summary: Lấy slot thời gian khả dụng của bác sĩ
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách slot khả dụng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slot:
 *                         type: string
 *                         example: "09:00-09:30"
 *                       available:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/available-slots',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getAvailableSlots, 'query'),
  appointmentController.getAvailableSlots
);

/**
 * @swagger
 * /api/appointments/stats:
 *   get:
 *     summary: Lấy thống kê lịch hẹn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Thống kê lịch hẹn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     confirmed:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     cancelled:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT, ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.CLINICAL_ADMIN]),
  validate(schemas.getAppointmentStats, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getAppointmentStats
);

/**
 * @swagger
 * /api/appointments/export/pdf:
 *   get:
 *     summary: Xuất lịch hẹn dạng PDF
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/export/pdf',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.exportAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.exportAppointmentsPDF
);

/**
 * @swagger
 * /api/appointments/export/excel:
 *   get:
 *     summary: Xuất lịch hẹn dạng Excel
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/export/excel',
  authMiddleware,
  roleMiddleware([ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.exportAppointments, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.exportAppointmentsExcel
);

/**
 * @swagger
 * /api/appointments/schedules/doctor/{doctorId}:
 *   get:
 *     summary: Lấy lịch làm việc của bác sĩ
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lịch làm việc của bác sĩ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/schedules/doctor/:doctorId',
  authMiddleware,
  roleMiddleware([ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.DEPARTMENT_HEAD, ROLES.HOSPITAL_ADMIN]),
  validate(schemas.getDoctorSchedule, 'params'),
  validate(schemas.getDoctorSchedule, 'query'),
  auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorSchedule
);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Lấy lịch hẹn của bác sĩ
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn của bác sĩ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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