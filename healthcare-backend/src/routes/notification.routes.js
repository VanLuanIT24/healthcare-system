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

// Lấy thông báo của tôi
router.get(
  '/',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  validate(notificationValidation.query, 'query'),
  notificationController.getMyNotifications
);

// Lấy số lượng chưa đọc
router.get(
  '/unread-count',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  notificationController.getUnreadCount
);

// Đánh dấu đã đọc
router.patch(
  '/:notificationId/read',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  validate(notificationValidation.notificationId, 'params'),
  notificationController.markAsRead
);

// Đánh dấu tất cả đã đọc
router.patch(
  '/read-all',
  requirePermission(PERMISSIONS['NOTIFICATION_VIEW']),
  notificationController.markAllAsRead
);

// Gửi thông báo
router.post(
  '/',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.sendNotification, 'body'),
  notificationController.sendNotification
);

// Gửi hàng loạt
router.post(
  '/bulk',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.bulkBody, 'body'),
  notificationController.sendBulkNotifications
);

// Lấy thông báo hệ thống
router.get(
  '/system',
  requirePermission(PERMISSIONS['NOTIFICATION_SYSTEM']),
  validate(notificationValidation.query, 'query'),
  notificationController.getSystemNotifications
);

// Kích hoạt nhắc nhở
router.post(
  '/reminders/:type/:referenceId',
  requirePermission(PERMISSIONS['NOTIFICATION_SEND']),
  validate(notificationValidation.reminderParams, 'params'),
  validate(notificationValidation.reminderBody, 'body'),
  notificationController.triggerReminder
);

// Lấy lịch sử thông báo
router.get(
  '/history',
  requirePermission(PERMISSIONS['SYSTEM_VIEW_AUDIT_LOG']),
  validate(notificationValidation.query, 'query'),
  notificationController.getNotificationHistory
);

module.exports = router;