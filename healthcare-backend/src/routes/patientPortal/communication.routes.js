const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { CommunicationController } = require("../../controllers/patientPortal");

const verifyAuth = authenticate;
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }
    req.validated = value;
    next();
  };
};

// Validation Schemas
const sendMessageSchema = Joi.object({
  recipientId: Joi.string().required(),
  subject: Joi.string().max(200).optional(),
  body: Joi.string().max(5000).required(),
  priority: Joi.string()
    .valid("Low", "Normal", "High", "Urgent")
    .default("Normal")
    .optional(),
  attachments: Joi.array().items(Joi.string()).optional(),
});

const threadSchema = Joi.object({
  participantIds: Joi.array().items(Joi.string()).required(),
  subject: Joi.string().max(200).required(),
  description: Joi.string().max(500).optional(),
});

const markAsReadSchema = Joi.object({
  messageIds: Joi.array().items(Joi.string()).required(),
});

// Routes
// GET: Lấy tất cả tin nhắn
router.get("/messages", verifyAuth, CommunicationController.getMessages);

// GET: Lấy tất cả cuộc trò chuyện
router.get("/threads", verifyAuth, CommunicationController.getThreads);

// GET: Tin nhắn trong cuộc trò chuyện
router.get(
  "/threads/:threadId/messages",
  verifyAuth,
  CommunicationController.getThreadMessages
);

// POST: Gửi tin nhắn mới
router.post(
  "/messages",
  verifyAuth,
  validateRequest(sendMessageSchema),
  CommunicationController.sendMessage
);

// POST: Tạo cuộc trò chuyện mới
router.post(
  "/threads",
  verifyAuth,
  validateRequest(threadSchema),
  CommunicationController.getOrCreateThread
);

// PUT: Đánh dấu tin nhắn đã đọc
router.put(
  "/messages/mark-read",
  verifyAuth,
  validateRequest(markAsReadSchema),
  CommunicationController.markMessageAsRead
);

// PUT: Đánh dấu tất cả đã đọc
router.put(
  "/messages/mark-all-read",
  verifyAuth,
  CommunicationController.markAllAsRead
);

// POST: Đóng cuộc trò chuyện
router.post(
  "/threads/:threadId/close",
  verifyAuth,
  CommunicationController.closeThread
);

// GET: Lấy thông báo
router.get(
  "/notifications",
  verifyAuth,
  CommunicationController.getNotifications
);

// GET: Đếm số tin nhắn chưa đọc
router.get("/unread-count", verifyAuth, CommunicationController.getUnreadCount);

module.exports = router;
