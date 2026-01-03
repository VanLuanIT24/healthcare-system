// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const {
  authenticate,
  requirePermission
} = require('../middlewares/auth.middleware');
const {
  validate
} = require('../middlewares/validation.middleware');
const {
  notificationValidation
} = require('../validations/notification.validation');
const { PERMISSIONS } = require('../constants/roles');

// Áp dụng xác thực cho tất cả routes
router.use(authenticate);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của tôi
 *     tags: [Notifications]
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
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
// Lấy thông báo của tôi
router.get(
  '/',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  validate(notificationValidation.query, 'query'),
  notificationController.getMyNotifications
);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Lấy số lượng thông báo chưa đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Số lượng chưa đọc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
// Lấy số lượng chưa đọc
router.get(
  '/unread-count',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  notificationController.getUnreadCount
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Đánh dấu thông báo đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 */
// Đánh dấu đã đọc
router.patch(
  '/:notificationId/read',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  validate(notificationValidation.notificationId, 'params'),
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Đánh dấu tất cả thông báo đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đánh dấu tất cả thành công
 */
// Đánh dấu tất cả đã đọc
router.patch(
  '/read-all',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  notificationController.markAllAsRead
);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Gửi thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success]
 *     responses:
 *       201:
 *         description: Gửi thành công
 */
// Gửi thông báo
router.post(
  '/',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.sendNotification, 'body'),
  notificationController.sendNotification
);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Gửi thông báo hàng loạt
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gửi thành công
 */
// Gửi hàng loạt
router.post(
  '/bulk',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.bulkBody, 'body'),
  notificationController.sendBulkNotifications
);

/**
 * @swagger
 * /api/notifications/system:
 *   get:
 *     summary: Lấy thông báo hệ thống
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Danh sách thông báo hệ thống
 */
// Lấy thông báo hệ thống
router.get(
  '/system',
  requirePermission(PERMISSIONS['NOTIFICATION_SYSTEM']),
  validate(notificationValidation.query, 'query'),
  notificationController.getSystemNotifications
);

/**
 * @swagger
 * /api/notifications/reminders/{type}/{referenceId}:
 *   post:
 *     summary: Kích hoạt nhắc nhở
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [appointment, medication, followup]
 *       - in: path
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Nhắc nhở đã được tạo
 */
// Kích hoạt nhắc nhở
router.post(
  '/reminders/:type/:referenceId',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.reminderParams, 'params'),
  validate(notificationValidation.reminderBody, 'body'),
  notificationController.triggerReminder
);

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Lấy lịch sử thông báo
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Lịch sử thông báo
 */
// Lấy lịch sử thông báo
router.get(
  '/history',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(notificationValidation.query, 'query'),
  notificationController.getNotificationHistory
);

module.exports = router;