// src/routes/doctorSchedule.routes.js
const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorSchedule.controller');
const { authenticate, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng authentication cho tất cả routes
router.use(authenticate);

/**
 * @swagger
 * /api/doctor-schedules/available-slots/{doctorId}/{date}:
 *   get:
 *     summary: Lấy slots khả dụng cho một ngày
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách slots khả dụng
 */
/**
 * @route   GET /api/doctor-schedules/available-slots/:doctorId/:date
 * @desc    Lấy slots khả dụng cho một ngày
 * @access  Private (có quyền SCHEDULE_VIEW)
 */
router.get(
  '/available-slots/:doctorId/:date',
  requirePermission(PERMISSIONS['SCHEDULE_VIEW']),
  doctorScheduleController.getAvailableSlots
);

/**
 * @swagger
 * /api/doctor-schedules/doctor/{doctorId}:
 *   get:
 *     summary: Lấy lịch làm việc của một bác sĩ
 *     tags: [Doctor Schedules]
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
 */
/**
 * @route   GET /api/doctor-schedules/doctor/:doctorId
 * @desc    Lấy lịch làm việc của một bác sĩ
 * @access  Private (có quyền SCHEDULE_VIEW)
 */
router.get(
  '/doctor/:doctorId',
  requirePermission(PERMISSIONS['SCHEDULE_VIEW']),
  doctorScheduleController.getDoctorSchedules
);

/**
 * @swagger
 * /api/doctor-schedules/bulk:
 *   post:
 *     summary: Tạo lịch hàng loạt
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - schedules
 *             properties:
 *               doctorId:
 *                 type: string
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       201:
 *         description: Tạo lịch thành công
 */
/**
 * @route   POST /api/doctor-schedules/bulk
 * @desc    Tạo lịch hàng loạt
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE_MANAGE)
 */
router.post(
  '/bulk',
  requirePermission(PERMISSIONS['SCHEDULE_MANAGE']),
  doctorScheduleController.bulkCreateSchedules
);

/**
 * @swagger
 * /api/doctor-schedules:
 *   get:
 *     summary: Lấy danh sách lịch làm việc
 *     tags: [Doctor Schedules]
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
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc
 */
/**
 * @route   GET /api/doctor-schedules
 * @desc    Lấy danh sách lịch làm việc
 * @access  Private (có quyền SCHEDULE_VIEW)
 */
router.get(
  '/',
  requirePermission(PERMISSIONS['SCHEDULE_VIEW']),
  doctorScheduleController.getSchedules
);

/**
 * @swagger
 * /api/doctor-schedules:
 *   post:
 *     summary: Tạo lịch làm việc mới
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               slotDuration:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       201:
 *         description: Tạo lịch thành công
 */
/**
 * @route   POST /api/doctor-schedules
 * @desc    Tạo lịch làm việc mới
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE_CREATE)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS['SCHEDULE_CREATE']),
  doctorScheduleController.createSchedule
);

/**
 * @swagger
 * /api/doctor-schedules/{id}:
 *   get:
 *     summary: Lấy chi tiết một lịch
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin lịch làm việc
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
/**
 * @route   GET /api/doctor-schedules/:id
 * @desc    Lấy chi tiết một lịch
 * @access  Private (có quyền SCHEDULE_VIEW)
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE_VIEW']),
  doctorScheduleController.getScheduleById
);

/**
 * @swagger
 * /api/doctor-schedules/{id}:
 *   put:
 *     summary: Cập nhật lịch làm việc
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
/**
 * @route   PUT /api/doctor-schedules/:id
 * @desc    Cập nhật lịch làm việc
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE_UPDATE)
 */
router.put(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE_UPDATE']),
  doctorScheduleController.updateSchedule
);

/**
 * @swagger
 * /api/doctor-schedules/{id}:
 *   delete:
 *     summary: Xóa lịch làm việc
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
/**
 * @route   DELETE /api/doctor-schedules/:id
 * @desc    Xóa lịch làm việc
 * @access  Private (SuperAdmin, Admin - có quyền SCHEDULE_DELETE)
 */
router.delete(
  '/:id',
  requirePermission(PERMISSIONS['SCHEDULE_DELETE']),
  doctorScheduleController.deleteSchedule
);

module.exports = router;
