// services/notification.service.js
const Notification = require('../models/notification.model');
const { AppError } = require('../middlewares/error.middleware');
const mongoose = require('mongoose');

class NotificationService {
  // Lấy thông báo của người dùng
  async getMyNotifications(userId, params) {
    const { page = 1, limit = 20, status, type } = params;
    const query = { toUserId: userId };
    if (status) query.status = status.toUpperCase();
    if (type) query.type = type.toUpperCase();

    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    return { notifications, total, page, limit };
  }

  // Lấy số lượng chưa đọc
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ toUserId: userId, status: 'UNREAD' });
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId, userId) {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new AppError('ID thông báo không hợp lệ', 400);
    }
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new AppError('Không tìm thấy thông báo', 404);
    }
    if (notification.toUserId.toString() !== userId.toString()) {
      throw new AppError('Không có quyền truy cập thông báo này', 403);
    }
    notification.status = 'READ';
    await notification.save();
    return notification;
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { toUserId: userId, status: 'UNREAD' },
      { status: 'READ' }
    );
  }

  // Gửi thông báo mới
  async sendNotification(data, senderId) {
    const notification = new Notification({
      ...data,
      createdBy: senderId
    });
    await notification.save();
    return notification;
  }

  // Gửi thông báo hàng loạt
  async sendBulkNotifications(data, senderId) {
    const notifications = data.map(item => new Notification({
      ...item,
      createdBy: senderId
    }));
    await Notification.insertMany(notifications);
    return notifications;
  }

  // Lấy thông báo hệ thống
  async getSystemNotifications(params) {
    const { page = 1, limit = 20, type } = params;
    const query = { toRole: 'ALL' };
    if (type) query.type = type.toUpperCase();

    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    return { notifications, total, page, limit };
  }

  // Kích hoạt nhắc nhở
  async triggerReminder(type, referenceId, data, senderId) {
    const reminder = new Notification({
      title: `Nhắc nhở: ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      message: data.message || `Có sự kiện ${type} cần xử lý (ID: ${referenceId})`,
      type: 'REMINDER',
      toUserId: data.toUserId,
      toRole: data.toRole || null,
      metadata: { referenceId, ...data.metadata },
      createdBy: senderId
    });
    await reminder.save();
    return reminder;
  }

  // Lấy lịch sử thông báo
  async getNotificationHistory(params) {
    const { page = 1, limit = 20, userId, type } = params;
    const query = {};
    if (userId) query.toUserId = userId;
    if (type) query.type = type.toUpperCase();

    const history = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('createdBy', 'personalInfo');

    const total = await Notification.countDocuments(query);

    return { history, total, page, limit };
  }
}

module.exports = new NotificationService();