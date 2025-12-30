// src/routes/doctorSchedule.routes.js
const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorSchedule.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng authentication cho tất cả routes
router.use(authenticate);

/**
 * @route   GET /api/doctor-schedules/available-slots/:doctorId/:date
 * @desc    Lấy slots khả dụng cho một ngày
 * @access  Private (có quyền SCHEDULE.VIEW)
 */
router.get(
  '/available-slots/:doctorId/:date',
  requirePermission(PERMISSIONS['SCHEDULE.VIEW']),
  doctorScheduleController.getAvailableSlots
);

/**
 * @route   GET /api/doctor-schedules/doctor/:doctorId
 * @desc    Lấy lịch làm việc của một bác sĩ
 * @access  Private (có quyền SCHEDULE.VIEW)
 */
router.get(
  '/doctor/:doctorId',
  requirePermission(PERMISSIONS['SCHEDULE.VIEW']),
  doctorScheduleController.getDoctorSchedules
);

/**
 * @route   POST /api/doctor-schedules/bulk
 * @desc    Tạo lịch hàng loạt
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE.MANAGE)
 */
router.post(
  '/bulk',
  requirePermission(PERMISSIONS['SCHEDULE.MANAGE']),
  doctorScheduleController.bulkCreateSchedules
);

/**
 * @route   GET /api/doctor-schedules
 * @desc    Lấy danh sách lịch làm việc
 * @access  Private (có quyền SCHEDULE.VIEW)
 */
router.get(
  '/',
  requirePermission(PERMISSIONS['SCHEDULE.VIEW']),
  doctorScheduleController.getSchedules
);

/**
 * @route   POST /api/doctor-schedules
 * @desc    Tạo lịch làm việc mới
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE.CREATE)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS['SCHEDULE.CREATE']),
  doctorScheduleController.createSchedule
);

/**
 * @route   GET /api/doctor-schedules/:id
 * @desc    Lấy chi tiết một lịch
 * @access  Private (có quyền SCHEDULE.VIEW)
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE.VIEW']),
  doctorScheduleController.getScheduleById
);

/**
 * @route   PUT /api/doctor-schedules/:id
 * @desc    Cập nhật lịch làm việc
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE.UPDATE)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE.UPDATE']),
  doctorScheduleController.updateSchedule
);

/**
 * @route   DELETE /api/doctor-schedules/:id
 * @desc    Xóa lịch làm việc
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE.DELETE)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE.DELETE']),
  doctorScheduleController.deleteSchedule
);

module.exports = router;
