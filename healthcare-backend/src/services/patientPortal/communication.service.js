const Communication = require("../../models/communication.model");
const CommunicationThread = require("../../models/communicationThread.model");
const AppError = require("../../utils/appError");

/**
 * Communication Service
 * Business logic for patient-doctor messaging
 */

class CommunicationService {
  /**
   * Get messages with filters
   */
  static async getMessages(patientId, filters = {}) {
    const query = { patientId };

    if (filters.threadId) query.threadId = filters.threadId;
    if (filters.read !== undefined) query.read = filters.read;
    if (filters.type) query.messageType = filters.type;

    return await Communication.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get single message
   */
  static async getMessageById(patientId, messageId) {
    const message = await Communication.findOne({
      _id: messageId,
      patientId,
    });

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    return message;
  }

  /**
   * Send message
   */
  static async sendMessage(patientId, messageData) {
    const message = new Communication({
      patientId,
      ...messageData,
      read: false,
      sender: {
        userId: patientId,
        role: "PATIENT",
      },
    });

    await message.save();

    // Update thread if exists
    if (messageData.threadId) {
      await CommunicationThread.findByIdAndUpdate(
        messageData.threadId,
        {
          messageCount: { $inc: 1 },
          lastMessageAt: new Date(),
          lastMessageBy: {
            userId: patientId,
            role: "PATIENT",
          },
          lastMessagePreview: messageData.content.substring(0, 100),
        },
        { new: true }
      );
    }

    return message;
  }

  /**
   * Mark message as read
   */
  static async markAsRead(patientId, messageId) {
    const message = await Communication.findOneAndUpdate(
      { _id: messageId, patientId },
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    return message;
  }

  /**
   * Mark all messages as read
   */
  static async markAllAsRead(patientId, threadId) {
    const result = await Communication.updateMany(
      { patientId, threadId, read: false },
      { read: true, readAt: new Date() }
    );

    return result.modifiedCount;
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(patientId) {
    const count = await Communication.countDocuments({
      patientId,
      read: false,
    });

    return count;
  }

  /**
   * Get conversation threads
   */
  static async getThreads(patientId, filters = {}) {
    const query = { patientId };

    if (filters.status) query.status = filters.status;

    return await CommunicationThread.find(query)
      .sort({ lastMessageAt: -1 })
      .lean();
  }

  /**
   * Get single thread
   */
  static async getThreadById(patientId, threadId) {
    const thread = await CommunicationThread.findOne({
      _id: threadId,
      patientId,
    });

    if (!thread) {
      throw new AppError("Thread not found", 404);
    }

    return thread;
  }

  /**
   * Create conversation thread
   */
  static async createThread(patientId, threadData) {
    // Check if thread already exists with same doctor
    if (threadData.doctorId) {
      const existing = await CommunicationThread.findOne({
        patientId,
        doctorId: threadData.doctorId,
      });

      if (existing) {
        return existing;
      }
    }

    const thread = new CommunicationThread({
      patientId,
      ...threadData,
      status: "OPEN",
      priority: "NORMAL",
      messageCount: 0,
    });

    await thread.save();
    return thread;
  }

  /**
   * Close thread
   */
  static async closeThread(patientId, threadId, closeData) {
    const thread = await this.getThreadById(patientId, threadId);

    thread.status = "CLOSED";
    thread.closedAt = new Date();

    if (closeData.satisfactionRating) {
      thread.satisfactionRating = closeData.satisfactionRating;
    }

    if (closeData.satisfactionComment) {
      thread.satisfactionComment = closeData.satisfactionComment;
    }

    await thread.save();
    return thread;
  }

  /**
   * Get messages from thread
   */
  static async getThreadMessages(patientId, threadId) {
    // Verify ownership
    await this.getThreadById(patientId, threadId);

    return await Communication.find({ threadId }).sort({ createdAt: 1 }).lean();
  }

  /**
   * Get notifications
   */
  static async getNotifications(patientId, unreadOnly = false) {
    const query = {
      patientId,
      messageType: "NOTIFICATION",
    };

    if (unreadOnly) query.read = false;

    return await Communication.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Update message priority
   */
  static async updatePriority(patientId, messageId, priority) {
    const message = await Communication.findOneAndUpdate(
      { _id: messageId, patientId },
      { priority },
      { new: true }
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    return message;
  }

  /**
   * Add reaction to message
   */
  static async addReaction(patientId, messageId, reaction) {
    const message = await Communication.findOne({
      _id: messageId,
    });

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    message.reactions.push({
      userId: patientId,
      reaction,
      date: new Date(),
    });

    await message.save();
    return message;
  }

  /**
   * Get conversation stats
   */
  static async getConversationStats(patientId) {
    const threads = await CommunicationThread.find({ patientId });

    const stats = {
      totalThreads: threads.length,
      activeThreads: threads.filter((t) => t.status === "OPEN").length,
      closedThreads: threads.filter((t) => t.status === "CLOSED").length,
      totalMessages: await Communication.countDocuments({ patientId }),
    };

    return stats;
  }
}

module.exports = CommunicationService;
