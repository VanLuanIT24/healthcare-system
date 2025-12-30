const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const QUEUE_STATUSES = ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED', 'RECALLED', 'COMPLETED'];
const QUEUE_TYPES = ['APPOINTMENT', 'WALK_IN'];

const schemas = {
  // ===== QUERY =====
  getQueue: Joi.object({
    doctorId: commonSchemas.objectId.optional(),
    departmentId: Joi.string().max(120).optional(),
    date: commonSchemas.date.optional(),
    status: Joi.string().valid(...QUEUE_STATUSES).optional(),
    type: Joi.string().valid(...QUEUE_TYPES).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }).unknown(true),

  getTodayQueue: Joi.object({}).unknown(true),

  getStats: Joi.object({
    doctorId: commonSchemas.objectId.optional(),
    departmentId: Joi.string().max(120).optional(),
    date: commonSchemas.date.optional()
  }).unknown(true),

  // ===== PARAMS =====
  doctorIdParam: Joi.object({
    doctorId: commonSchemas.objectId.required()
  }),

  queueIdParam: Joi.object({
    queueId: commonSchemas.objectId.required()
  }),

  // ===== BODY =====
  addToQueue: Joi.object({
    appointmentId: commonSchemas.objectId.required()
  }),

  addWalkIn: Joi.object({
    patientId: commonSchemas.objectId.required(),
    doctorId: commonSchemas.objectId.required(),
    reason: Joi.string().max(500).optional()
  }),

  skipPatient: Joi.object({
    reason: Joi.string().max(500).optional()
  }),

  completePatient: Joi.object({
    notes: Joi.string().max(1000).optional()
  })
};

module.exports = { schemas, QUEUE_STATUSES, QUEUE_TYPES };
