const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const notificationValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(5).max(100).default(20),
    status: Joi.string().valid('UNREAD', 'READ', 'ARCHIVED').optional(),
    type: Joi.string().valid('SYSTEM', 'REMINDER', 'ERROR', 'INFO').optional()
  }).unknown(true),

  sendNotification: Joi.object({
    title: Joi.string().max(200).required(),
    message: Joi.string().max(2000).required(),
    type: Joi.string().valid('SYSTEM', 'REMINDER', 'ERROR', 'INFO').optional(),
    channel: Joi.string().valid('IN_APP', 'EMAIL', 'SMS').optional(),
    toUserId: commonSchemas.objectId.optional(),
    toRole: Joi.string().optional(),
    metadata: Joi.object().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  bulkNotifications: Joi.array().items(Joi.object({
    title: Joi.string().max(200).required(),
    message: Joi.string().max(2000).required(),
    toUserId: commonSchemas.objectId.optional(),
    toRole: Joi.string().optional(),
    metadata: Joi.object().optional(),
    channel: Joi.string().valid('IN_APP', 'EMAIL', 'SMS').optional()
  })).min(1),

  reminder: Joi.object({
    metadata: Joi.object().optional()
  }),

  notificationId: Joi.object({
    notificationId: commonSchemas.objectId.required()
  })
};

module.exports = { notificationValidation };
