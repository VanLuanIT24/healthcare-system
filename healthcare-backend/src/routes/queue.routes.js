// src/routes/queue.routes.js
const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { validate } = require('../middlewares/validation.middleware');
const { schemas } = require('../validations/queue.validation');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole, requirePermission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');

router.use(authenticate);

/**
 * @swagger
 * /api/queue:
 *   get:
 *     summary: Lấy danh sách hàng đợi
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, called, in-consultation, completed, skipped]
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách hàng đợi
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
 *                     $ref: '#/components/schemas/Queue'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.getQueue, 'query'),
  queueController.getQueue
);

/**
 * @swagger
 * /api/queue/today:
 *   get:
 *     summary: Lấy hàng đợi hôm nay
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hàng đợi hôm nay
 */
router.get(
  '/today',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.getQueue, 'query'),
  queueController.getTodayQueue
);

/**
 * @swagger
 * /api/queue/current/{doctorId}:
 *   get:
 *     summary: Lấy bệnh nhân hiện tại đang khám
 *     tags: [Queue]
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
 *         description: Thông tin bệnh nhân hiện tại
 */
router.get(
  '/current/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.doctorIdParam, 'params'),
  queueController.getCurrentPatient
);

/**
 * @swagger
 * /api/queue/{doctorId}/next:
 *   post:
 *     summary: Gọi bệnh nhân tiếp theo
 *     tags: [Queue]
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
 *         description: Bệnh nhân tiếp theo
 */
router.post(
  '/:doctorId/next',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_CALL_NEXT),
  validate(schemas.doctorIdParam, 'params'),
  queueController.callNext
);

/**
 * @swagger
 * /api/queue/{queueId}/skip:
 *   patch:
 *     summary: Bỏ qua bệnh nhân
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bỏ qua thành công
 */
router.patch(
  '/:queueId/skip',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_SKIP),
  validate(schemas.queueIdParam, 'params'),
  validate(schemas.skipPatient, 'body'),
  queueController.skipPatient
);

/**
 * @swagger
 * /api/queue/{queueId}/recall:
 *   patch:
 *     summary: Gọi lại bệnh nhân
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gọi lại thành công
 */
router.patch(
  '/:queueId/recall',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_RECALL),
  validate(schemas.queueIdParam, 'params'),
  queueController.recallPatient
);

/**
 * @swagger
 * /api/queue/{queueId}/complete:
 *   patch:
 *     summary: Hoàn thành khám bệnh nhân
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hoàn thành thành công
 */
router.patch(
  '/:queueId/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.QUEUE_COMPLETE),
  validate(schemas.queueIdParam, 'params'),
  validate(schemas.completePatient, 'body'),
  queueController.completePatient
);

/**
 * @swagger
 * /api/queue/add:
 *   post:
 *     summary: Thêm bệnh nhân vào hàng đợi (sau check-in)
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *               priority:
 *                 type: number
 *     responses:
 *       201:
 *         description: Thêm vào hàng đợi thành công
 */
router.post(
  '/add',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR),
  requirePermission(PERMISSIONS.QUEUE_ADD),
  validate(schemas.addToQueue, 'body'),
  queueController.addToQueue
);

// Thêm bệnh nhân tự do (walk-in)
router.post(
  '/walk-in',
  requireRole(ROLES.RECEPTIONIST),
  requirePermission(PERMISSIONS.QUEUE_WALK_IN),
  validate(schemas.addWalkIn, 'body'),
  queueController.addWalkIn
);

// Thống kê hàng đợi
router.get(
  '/stats',
  requireRole(ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.QUEUE_STATS),
  validate(schemas.getStats, 'query'),
  queueController.getQueueStats
);

// Ước tính thời gian chờ
router.get(
  '/wait-time/:doctorId',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_WAIT_TIME),
  validate(schemas.doctorIdParam, 'params'),
  queueController.getEstimatedWaitTime
);

module.exports = router;