const Communication = require("../../models/communication.model");
const CommunicationThread = require("../../models/communicationThread.model");
const AppError = require("../../utils/appError");
const { successResponse } = require("../../utils/responseHandler");

/**
 * Communication Controller
 * Quản lý tin nhắn và thông báo
 */

class CommunicationController {
  /**
   * Lấy danh sách tất cả tin nhắn
   */
  static async getMessages(req, res, next) {
    try {
      const { patientId } = req.user;
      const { threadId, read, page = 1, limit = 20 } = req.query;

      const filter = { patientId };
      if (threadId) filter.threadId = threadId;
      if (read !== undefined) filter.read = read === "true";

      const skip = (page - 1) * limit;
      const total = await Communication.countDocuments(filter);

      const messages = await Communication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(res, messages, "Messages retrieved successfully", 200, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách conversation threads
   */
  static async getThreads(req, res, next) {
    try {
      const { patientId } = req.user;
      const { status, page = 1, limit = 10 } = req.query;

      const filter = { patientId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await CommunicationThread.countDocuments(filter);

      const threads = await CommunicationThread.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        threads,
        "Conversation threads retrieved successfully",
        200,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy messages từ một thread
   */
  static async getThreadMessages(req, res, next) {
    try {
      const { patientId } = req.user;
      const { threadId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Verify ownership of thread
      const thread = await CommunicationThread.findOne({
        _id: threadId,
        patientId,
      });

      if (!thread) {
        return next(new AppError("Thread not found", 404));
      }

      const skip = (page - 1) * limit;
      const total = await Communication.countDocuments({ threadId });

      const messages = await Communication.find({ threadId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        messages,
        "Thread messages retrieved successfully",
        200,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gửi tin nhắn
   */
  static async sendMessage(req, res, next) {
    try {
      const { patientId } = req.user;
      const { recipientId, threadId, content, messageType = "CHAT" } = req.body;

      // Verify thread ownership if threadId provided
      let thread = null;
      if (threadId) {
        thread = await CommunicationThread.findOne({
          _id: threadId,
          patientId,
        });

        if (!thread) {
          return next(new AppError("Thread not found", 404));
        }
      }

      // Create message
      const message = new Communication({
        patientId,
        doctorId: recipientId,
        threadId: threadId || null,
        sender: {
          userId: patientId,
          name: req.user.name,
          role: "PATIENT",
        },
        recipient: {
          userId: recipientId,
          name: "Doctor",
        },
        messageType,
        content,
        read: false,
      });

      await message.save();

      // Update thread
      if (thread) {
        thread.messageCount += 1;
        thread.lastMessageAt = new Date();
        thread.lastMessageBy = {
          userId: patientId,
          name: req.user.name,
          role: "PATIENT",
        };
        thread.lastMessagePreview = content.substring(0, 100);
        await thread.save();
      }

      successResponse(res, message, "Message sent successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark message as read
   */
  static async markMessageAsRead(req, res, next) {
    try {
      const { patientId } = req.user;
      const { messageId } = req.params;

      const message = await Communication.findOneAndUpdate(
        { _id: messageId, patientId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!message) {
        return next(new AppError("Message not found", 404));
      }

      successResponse(res, message, "Message marked as read", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all messages as read
   */
  static async markAllAsRead(req, res, next) {
    try {
      const { patientId } = req.user;
      const { threadId } = req.params;

      const result = await Communication.updateMany(
        { patientId, threadId, read: false },
        { read: true, readAt: new Date() }
      );

      successResponse(
        res,
        { modifiedCount: result.modifiedCount },
        "All messages marked as read",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách thông báo
   */
  static async getNotifications(req, res, next) {
    try {
      const { patientId } = req.user;
      const { unread = false, page = 1, limit = 10 } = req.query;

      const filter = {
        patientId,
        messageType: "NOTIFICATION",
      };
      if (unread === "true") filter.read = false;

      const skip = (page - 1) * limit;
      const total = await Communication.countDocuments(filter);

      const notifications = await Communication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      successResponse(
        res,
        notifications,
        "Notifications retrieved successfully",
        200,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đếm thông báo chưa đọc
   */
  static async getUnreadCount(req, res, next) {
    try {
      const { patientId } = req.user;

      const unreadMessages = await Communication.countDocuments({
        patientId,
        read: false,
        messageType: { $in: ["CHAT", "NOTIFICATION"] },
      });

      const unreadNotifications = await Communication.countDocuments({
        patientId,
        read: false,
        messageType: "NOTIFICATION",
      });

      successResponse(
        res,
        {
          totalUnread: unreadMessages,
          unreadNotifications,
          unreadMessages: unreadMessages - unreadNotifications,
        },
        "Unread count retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo hoặc lấy conversation thread
   */
  static async getOrCreateThread(req, res, next) {
    try {
      const { patientId } = req.user;
      const { doctorId, subject, category } = req.body;

      // Check if thread already exists
      let thread = await CommunicationThread.findOne({
        patientId,
        doctorId,
      });

      if (!thread) {
        thread = new CommunicationThread({
          patientId,
          doctorId,
          subject: subject || "New Conversation",
          category: category || "GENERAL_INQUIRY",
          status: "OPEN",
          priority: "NORMAL",
          participants: [
            {
              userId: patientId,
              role: "PATIENT",
            },
            {
              userId: doctorId,
              role: "DOCTOR",
            },
          ],
        });

        await thread.save();
      }

      successResponse(
        res,
        thread,
        "Conversation thread retrieved/created successfully",
        thread.isNew ? 201 : 200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đóng conversation thread
   */
  static async closeThread(req, res, next) {
    try {
      const { patientId } = req.user;
      const { threadId } = req.params;
      const { satisfactionRating, satisfactionComment } = req.body;

      const thread = await CommunicationThread.findOneAndUpdate(
        { _id: threadId, patientId },
        {
          status: "CLOSED",
          satisfactionRating,
          satisfactionComment,
        },
        { new: true }
      );

      if (!thread) {
        return next(new AppError("Thread not found", 404));
      }

      successResponse(res, thread, "Thread closed successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommunicationController;
