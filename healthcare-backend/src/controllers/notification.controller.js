// controllers/notification.controller.js
const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middlewares/error.middleware');
const { manualAuditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class NotificationController {
  // Lấy thông báo của người dùng hiện tại
  getMyNotifications = asyncHandler(async (req, res) => {
    const params = req.query;
    const notifications = await notificationService.getMyNotifications(req.user._id, params);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_VIEW,
      user: req.user,
      metadata: { type: 'personal' }
    });
    res.json({
      success: true,
      data: notifications
    });
  });

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  });

  // Đánh dấu thông báo đã đọc
  markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId, req.user._id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_UPDATE,
      user: req.user,
      metadata: { notificationId, action: 'read' }
    });
    res.json({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: notification
    });
  });

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user._id);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_UPDATE,
      user: req.user,
      metadata: { action: 'read_all' }
    });
    res.json({
      success: true,
      message: 'Đánh dấu tất cả đã đọc thành công'
    });
  });

  // Gửi thông báo mới
  sendNotification = asyncHandler(async (req, res) => {
    const data = req.body;
    const senderId = req.user._id;
    const notification = await notificationService.sendNotification(data, senderId);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_SEND,
      user: req.user,
      metadata: { notificationId: notification._id, toUserId: data.toUserId }
    });
    res.status(201).json({
      success: true,
      message: 'Gửi thông báo thành công',
      data: notification
    });
  });

  // Gửi thông báo hàng loạt
  sendBulkNotifications = asyncHandler(async (req, res) => {
    const data = req.body;
    const senderId = req.user._id;
    const notifications = await notificationService.sendBulkNotifications(data, senderId);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_SEND,
      user: req.user,
      metadata: { count: notifications.length, type: 'bulk' }
    });
    res.status(201).json({
      success: true,
      message: 'Gửi thông báo hàng loạt thành công',
      data: notifications
    });
  });

  // Lấy thông báo hệ thống
  getSystemNotifications = asyncHandler(async (req, res) => {
    const params = req.query;
    const notifications = await notificationService.getSystemNotifications(params);
    res.json({
      success: true,
      data: notifications
    });
  });

  // Kích hoạt nhắc nhở
  triggerReminder = asyncHandler(async (req, res) => {
    const { type, referenceId } = req.params;
    const data = req.body;
    const senderId = req.user._id;
    const reminder = await notificationService.triggerReminder(type, referenceId, data, senderId);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_SEND,
      user: req.user,
      metadata: { type: 'reminder', referenceId }
    });
    res.status(201).json({
      success: true,
      message: 'Kích hoạt nhắc nhở thành công',
      data: reminder
    });
  });

  // Lấy lịch sử thông báo
  getNotificationHistory = asyncHandler(async (req, res) => {
    const params = req.query;
    const history = await notificationService.getNotificationHistory(params);
    await manualAuditLog({
      action: AUDIT_ACTIONS.NOTIFICATION_VIEW,
      user: req.user,
      metadata: { type: 'history' }
    });
    res.json({
      success: true,
      data: history
    });
  });
}

module.exports = new NotificationController();