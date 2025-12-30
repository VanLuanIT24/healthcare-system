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

// Lấy danh sách hàng đợi (có filter)
router.get(
  '/',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.getQueue, 'query'),
  queueController.getQueue
);

// Lấy hàng đợi hôm nay
router.get(
  '/today',
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.getQueue, 'query'),
  queueController.getTodayQueue
);

// Lấy bệnh nhân hiện tại đang khám
router.get(
  '/current/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.QUEUE_VIEW),
  validate(schemas.doctorIdParam, 'params'),
  queueController.getCurrentPatient
);

// Gọi bệnh nhân tiếp theo
router.post(
  '/:doctorId/next',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_CALL_NEXT),
  validate(schemas.doctorIdParam, 'params'),
  queueController.callNext
);

// Bỏ qua bệnh nhân
router.patch(
  '/:queueId/skip',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_SKIP),
  validate(schemas.queueIdParam, 'params'),
  validate(schemas.skipPatient, 'body'),
  queueController.skipPatient
);

// Gọi lại bệnh nhân
router.patch(
  '/:queueId/recall',
  requireRole(ROLES.DOCTOR, ROLES.NURSE),
  requirePermission(PERMISSIONS.QUEUE_RECALL),
  validate(schemas.queueIdParam, 'params'),
  queueController.recallPatient
);

// Hoàn thành bệnh nhân
router.patch(
  '/:queueId/complete',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.QUEUE_COMPLETE),
  validate(schemas.queueIdParam, 'params'),
  validate(schemas.completePatient, 'body'),
  queueController.completePatient
);

// Thêm từ lịch hẹn (sau check-in)
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